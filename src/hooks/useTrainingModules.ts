
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrainingModuleProgress } from "@/types/training";
import { useAuth } from "@/contexts/auth";

export const useTrainingModules = (jobId?: string) => {
  const { user } = useAuth();
  const [modules, setModules] = useState<TrainingModuleProgress[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrainingModules = async () => {
    try {
      setLoading(true);
      
      // If no job ID is provided, fetch all training modules
      if (!jobId) {
        const { data, error } = await supabase
          .from("training_modules")
          .select("id, title, description, module")
          .eq("archived", false)
          .order("title");

        if (error) throw error;
        
        const formattedModules: TrainingModuleProgress[] = data ? data.map(module => ({
          id: module.id,
          title: module.title || 'Untitled Module',
          description: module.description,
          module: module.module || 'general',
          progress: 0,
          status: 'active' as const,
          locked: false,
          videos: [],
          quizIds: [],
          totalVideos: 0,
          watchedVideos: 0,
          quizCompleted: false
        })) : [];
        
        setModules(formattedModules);
        return;
      }
      
      // If job ID is provided, fetch only modules associated with that job
      console.log("Fetching training modules for job:", jobId);
      
      // Get the modules IDs associated with this job
      const { data: jobTrainingData, error: jobTrainingError } = await supabase
        .from('job_training')
        .select('training_module_id')
        .eq('job_id', jobId);
        
      if (jobTrainingError) {
        console.error("Job training error:", jobTrainingError);
        throw jobTrainingError;
      }
      
      // No modules assigned to this job
      if (!jobTrainingData || jobTrainingData.length === 0) {
        setModules([]);
        setLoading(false);
        return;
      }
      
      // Get module IDs
      const moduleIds = jobTrainingData.map(item => item.training_module_id);
      
      // Fetch the actual modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('training_modules')
        .select('id, title, description, module, quiz_id')
        .in('id', moduleIds)
        .eq('archived', false)
        .order('title');
        
      if (modulesError) {
        console.error("Modules error:", modulesError);
        throw modulesError;
      }
      
      // Get videos for these modules
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('id, title, module')
        .eq('archived', false);
        
      if (videosError) {
        console.error("Videos error:", videosError);
        throw videosError;
      }
      
      // Get video progress
      let videoProgress: Record<string, boolean> = {};
      let quizResults: Record<string, boolean> = {};
      
      if (user) {
        // Get video progress
        const { data: progressData, error: progressError } = await supabase
          .from('training_progress')
          .select('video_id, completed, module')
          .eq('user_id', user.id);
          
        if (progressError) {
          console.error("Progress error:", progressError);
        } else if (progressData) {
          videoProgress = progressData.reduce((acc, item) => {
            if (item.completed && item.video_id) {
              acc[item.video_id] = true;
            }
            return acc;
          }, {} as Record<string, boolean>);
        }
        
        // Get quiz results
        const { data: quizData, error: quizError } = await supabase
          .from('quiz_results')
          .select('module, passed')
          .eq('user_id', user.id)
          .eq('passed', true);
          
        if (quizError) {
          console.error("Quiz results error:", quizError);
        } else if (quizData) {
          quizResults = quizData.reduce((acc, item) => {
            acc[item.module] = true;
            return acc;
          }, {} as Record<string, boolean>);
        }
      }
      
      // Prepare the modules with progress data
      const formattedModules: TrainingModuleProgress[] = [];
      let prevComplete = true; // First module is always unlocked
      
      for (const module of (modulesData || [])) {
        // Get videos for this module
        const moduleVideos = videosData?.filter(video => video.module === module.module) || [];
        
        // Calculate completion stats
        const totalVideos = moduleVideos.length;
        const watchedVideos = moduleVideos.filter(video => videoProgress[video.id]).length;
        
        // Check if quiz completed
        const quizIds = module.quiz_id ? [module.quiz_id] : [];
        const quizCompleted = quizResults[module.module] || false;
        
        // Calculate progress
        let progress = 0;
        if (totalVideos > 0) {
          // Videos are 80% of progress, quiz is 20%
          const videoProgress = (watchedVideos / totalVideos) * 80;
          const quizProgress = quizCompleted ? 20 : 0;
          progress = Math.round(videoProgress + quizProgress);
        } else if (quizCompleted) {
          progress = 100;
        }
        
        // Determine if module is complete
        const isComplete = progress === 100;
        
        // Status based on completion and lock state
        const locked = !prevComplete; 
        let status: 'active' | 'inactive' | 'locked' | 'completed' | 'in_progress';
        
        if (locked) {
          status = 'locked';
        } else if (isComplete) {
          status = 'completed';
        } else if (watchedVideos > 0 || quizCompleted) {
          status = 'in_progress';
        } else {
          status = 'active';
        }
        
        // Update lock status for next module
        prevComplete = prevComplete && isComplete;
        
        formattedModules.push({
          id: module.id,
          title: module.title || 'Untitled Module',
          description: module.description,
          module: module.module || 'general',
          progress,
          status,
          locked,
          videos: [],
          quizIds,
          totalVideos,
          watchedVideos,
          quizCompleted
        });
      }
      
      console.log("Formatted modules:", formattedModules);
      setModules(formattedModules);
      
    } catch (error: any) {
      console.error("Error in useTrainingModules:", error);
      toast.error(`Failed to fetch training modules: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingModules();
  }, [jobId, user?.id]);

  return {
    modules,
    loading,
    fetchTrainingModules
  };
};
