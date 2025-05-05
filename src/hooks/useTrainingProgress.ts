
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Reusable types
interface Video {
  id: string;
  title: string;
  description: string | null;
  url: string;
  duration: string | null;
  module: string;
}

export interface TrainingModuleProgress {
  id: string; // Module definition ID
  title: string;
  description: string | null;
  module: string; // The category identifier (e.g., 'product')
  progress: number; // 0 to 100 based on video completion and quiz
  status: 'completed' | 'in_progress' | 'locked';
  locked: boolean;
  videos: Video[];
  quizIds: string[] | null; // Updated to store multiple quiz IDs
  totalVideos: number;
  watchedVideos: number;
  quizCompleted: boolean;
}

export interface TrainingProgressState {
  product: number;
  sales: number;
  relationship: number;
  overall: number;
  categories: Record<string, number>; // Progress by category name
}

// Define the return type of the hook
interface UseTrainingProgressReturn {
  trainingModules: TrainingModuleProgress[];
  progress: TrainingProgressState;
  isLoading: boolean;
  error: string | null;
  refetch: () => void; // Function to manually refetch data
}

export const useTrainingProgress = (): UseTrainingProgressReturn => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trainingModules, setTrainingModules] = useState<TrainingModuleProgress[]>([]);
  const [progress, setProgress] = useState<TrainingProgressState>({
    product: 0,
    sales: 0,
    relationship: 0,
    overall: 0,
    categories: {}
  });

  const fetchTrainingData = useCallback(async () => {
    // Ensure user context is loaded before fetching
    if (!user?.id) {
      return;
    }

    try {
      console.log("Hook: Fetching training data for user:", user.id);
      setIsLoading(true);
      setError(null);

      // --- Fetch all data concurrently ---
      // Since module_categories table is removed, we'll infer module information from videos
      const [videoResult, trainingProgressResult, quizResultsResult] = await Promise.all([
        supabase
          .from('videos')
          .select('*'),
        supabase
          .from('training_progress')
          .select('video_id, completed, module')
          .eq('user_id', user.id)
          .eq('completed', true),
        supabase
          .from('quiz_results')
          .select('module, passed')
          .eq('user_id', user.id)
          .eq('passed', true)
      ]);

      // --- Check for errors after all promises settle ---
      if (videoResult.error) throw new Error(`Videos fetch failed: ${videoResult.error.message}`);
      if (trainingProgressResult.error) throw new Error(`Training progress fetch failed: ${trainingProgressResult.error.message}`);
      if (quizResultsResult.error) throw new Error(`Quiz results fetch failed: ${quizResultsResult.error.message}`);

      const videos = videoResult.data || [];
      const completedVideos = trainingProgressResult.data || [];
      const passedQuizzes = quizResultsResult.data || [];

      // Debug logs
      console.log("Hook: Fetched Videos:", videos);
      console.log("Hook: Fetched Completed Videos:", completedVideos);
      console.log("Hook: Fetched Passed Quizzes:", passedQuizzes);

      const watchedVideoIds = new Set(completedVideos.filter(item => item.completed).map(item => item.video_id));
      
      // Create set of passed quiz modules for quick lookup
      const passedQuizModules = new Set(passedQuizzes.map(quiz => quiz.module));

      // Group videos by module
      const modulesByName: Record<string, Video[]> = {};
      videos.forEach(video => {
        const moduleName = video.module;
        if (!modulesByName[moduleName]) {
          modulesByName[moduleName] = [];
        }
        modulesByName[moduleName].push(video as Video);
      });

      // --- Process modules with videos ---
      let previousModuleCompleted = true; // First module is always unlocked
      const moduleNames = Object.keys(modulesByName);
      
      const formattedModules: TrainingModuleProgress[] = moduleNames.map((moduleName, index) => {
        const moduleVideos = modulesByName[moduleName] || [];
        const totalVideos = moduleVideos.length;
        const watchedVideos = moduleVideos.filter(video => watchedVideoIds.has(video.id)).length;
        const quizCompleted = passedQuizModules.has(moduleName);
        
        // Calculate module progress
        let moduleProgress = 0;
        if (totalVideos > 0) {
          // Videos are 80% of progress, quiz is 20%
          const videoProgress = (watchedVideos / totalVideos) * 80;
          const quizProgress = quizCompleted ? 20 : 0;
          moduleProgress = Math.round(videoProgress + quizProgress);
        } else if (quizCompleted) {
          // If no videos but quiz completed
          moduleProgress = 100;
        }
        
        // Determine if module is complete
        const isModuleComplete = moduleProgress === 100;
        
        // Determine if module should be locked based on previous module
        const locked = index > 0 ? !previousModuleCompleted : false;
        const status = locked ? 'locked' : (isModuleComplete ? 'completed' : 'in_progress');
        
        // Update completion status for next module's lock check
        previousModuleCompleted = !locked && isModuleComplete;
        
        return {
          id: moduleName, // Using module name as ID since we don't have categories anymore
          title: moduleName.charAt(0).toUpperCase() + moduleName.slice(1), // Capitalize module name
          description: `Videos for ${moduleName}`,
          module: moduleName.toLowerCase(),
          progress: moduleProgress,
          status: status,
          locked: locked,
          videos: moduleVideos,
          quizIds: null, // We don't have quiz_ids from module_categories anymore
          totalVideos,
          watchedVideos,
          quizCompleted
        };
      });

      // --- Calculate progress states ---
      const categoriesProgress: Record<string, number> = {};
      
      formattedModules.forEach(module => {
        categoriesProgress[module.module] = module.progress;
      });
      
      // Calculate overall progress
      const totalModules = formattedModules.length;
      const overallProgress = totalModules > 0 
        ? Math.round(formattedModules.reduce((sum, mod) => sum + mod.progress, 0) / totalModules)
        : 0;

      const newProgressState = {
        product: categoriesProgress['product'] || 0,
        sales: categoriesProgress['sales'] || 0,
        relationship: categoriesProgress['relationship'] || 0,
        overall: overallProgress,
        categories: categoriesProgress
      };

      console.log("Hook: Final Formatted Modules:", formattedModules);
      console.log("Hook: Final Progress State:", newProgressState);

      // --- Update State ---
      setTrainingModules(formattedModules);
      setProgress(newProgressState);
      setError(null);

    } catch (error: any) {
      console.error("Hook: Error fetching training data:", error);
      setError(error.message || "Failed to load training data.");
      toast.error("Failed to load training data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Effect to fetch data on mount or when user ID changes
  useEffect(() => {
    // Wait for user context to be loaded
    if(user === undefined) {
        console.log("Hook: User context is undefined, waiting...");
        setIsLoading(true);
        return;
    }
    // If user is null after context loaded, means not logged in
    if (user === null) {
        console.log("Hook: User is null, not logged in.");
        setIsLoading(false);
        setError("User not authenticated.");
        setTrainingModules([]);
        setProgress({ product: 0, sales: 0, relationship: 0, overall: 0, categories: {} });
        return;
    }
    // If user object is present (logged in), fetch data
    fetchTrainingData();
  }, [user, fetchTrainingData]);

  // Return state and refetch function
  return { trainingModules, progress, isLoading, error, refetch: fetchTrainingData };
};
