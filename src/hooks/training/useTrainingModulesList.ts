
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  module: string;
  progress: number;
  status: 'completed' | 'in_progress' | 'locked';
  locked: boolean;
  videos: any[];
  quizIds: string[] | null;
  totalVideos: number;
  watchedVideos: number;
  quizCompleted: boolean;
}

export const useTrainingModulesList = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);

  const fetchTrainingData = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      console.log("Hook: Fetching training data for user:", user.id);
      setIsLoading(true);
      setError(null);

      const [categoriesResult, videoResult, trainingProgressResult, quizResultsResult, categoryVideosResult] = await Promise.all([
        supabase.from('module_categories').select('*, quiz_ids').order('name', { ascending: true }),
        supabase.from('videos').select('*'),
        supabase.from('training_progress').select('*')
          .eq('user_id', user.id)
          .eq('completed', true),
        supabase.from('quiz_results').select('*')
          .eq('user_id', user.id)
          .eq('passed', true),
        supabase.from('category_videos').select('*')
      ]);

      // Error handling
      if (categoriesResult.error) throw new Error(`Module categories fetch failed: ${categoriesResult.error.message}`);
      if (videoResult.error) throw new Error(`Videos fetch failed: ${videoResult.error.message}`);
      if (trainingProgressResult.error) throw new Error(`Training progress fetch failed: ${trainingProgressResult.error.message}`);
      if (quizResultsResult.error) throw new Error(`Quiz results fetch failed: ${quizResultsResult.error.message}`);
      if (categoryVideosResult.error) throw new Error(`Category videos fetch failed: ${categoryVideosResult.error.message}`);

      const watchedVideoIds = new Set(trainingProgressResult.data.map(item => item.video_id));
      const passedQuizModules = new Set(quizResultsResult.data.map(quiz => quiz.module));

      let previousModuleCompleted = true;
      const formattedModules = categoriesResult.data.map((category, index) => {
        const categoryVideos = videoResult.data.filter(video => 
          categoryVideosResult.data.some(cv => cv.category_id === category.id && cv.video_id === video.id) ||
          video.module === category.name
        );

        const totalVideos = categoryVideos.length;
        const watchedVideos = categoryVideos.filter(video => watchedVideoIds.has(video.id)).length;
        const quizCompleted = passedQuizModules.has(category.id);
        
        let moduleProgress = 0;
        if (totalVideos > 0) {
          const videoProgress = (watchedVideos / totalVideos) * 80;
          const quizProgress = quizCompleted ? 20 : 0;
          moduleProgress = Math.round(videoProgress + quizProgress);
        } else if (quizCompleted) {
          moduleProgress = 100;
        }

        const isModuleComplete = moduleProgress === 100;
        const locked = index > 0 ? !previousModuleCompleted : false;
        previousModuleCompleted = !locked && isModuleComplete;

        return {
          id: category.id,
          title: category.name,
          description: category.description,
          module: category.name.toLowerCase(),
          progress: moduleProgress,
          status: locked ? 'locked' : (isModuleComplete ? 'completed' : 'in_progress'),
          locked,
          videos: categoryVideos,
          quizIds: category.quiz_ids,
          totalVideos,
          watchedVideos,
          quizCompleted
        };
      });

      setTrainingModules(formattedModules);

    } catch (error: any) {
      console.error("Hook: Error fetching training data:", error);
      setError(error.message || "Failed to load training data.");
      toast.error("Failed to load training data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    trainingModules,
    isLoading,
    error,
    refetch: fetchTrainingData
  };
};
