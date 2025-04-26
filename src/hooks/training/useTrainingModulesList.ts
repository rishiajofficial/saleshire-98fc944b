
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrainingModule, Video } from "@/types/training";
import { useTrainingProgress } from "./useTrainingProgress";

export function useTrainingModulesList(userId?: string) {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { videoProgress, completedQuizzes, calculateModuleProgress } = useTrainingProgress(userId);

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all training modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('module_categories')
        .select('*')
        .order('name', { ascending: true });
        
      if (modulesError) throw modulesError;
      
      // Get all videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*');
      
      if (videosError) throw videosError;
      
      // Get video-category relationships
      const { data: categoryVideos, error: categoryVideosError } = await supabase
        .from('category_videos')
        .select('*');
      
      if (categoryVideosError) throw categoryVideosError;
        
      // Map of module IDs to their videos
      const moduleVideosMap: Record<string, Video[]> = {};
      
      // Build the video map from category_videos relationships
      categoryVideos?.forEach(relation => {
        const categoryId = relation.category_id;
        const videoId = relation.video_id;
        
        if (!moduleVideosMap[categoryId]) {
          moduleVideosMap[categoryId] = [];
        }
        
        const video = videosData?.find(v => v.id === videoId);
        if (video) {
          moduleVideosMap[categoryId].push(video as Video);
        }
      });
      
      // Create training modules with progress info
      const trainingModules: TrainingModule[] = [];
      
      let previousCompleted = true; // First module is always unlocked
      
      for (const moduleData of modulesData || []) {
        const videos = moduleVideosMap[moduleData.id] || [];
        const quizIds = moduleData.quiz_ids || [];
        
        // Calculate progress for this module
        const progress = calculateModuleProgress(videos, quizIds);
        
        // Determine if module should be locked
        const locked = !previousCompleted;
        
        // Count watched videos
        const watchedVideos = videos.filter(video => 
          videoProgress[video.id]
        ).length;
        
        // Check if quiz is completed
        const quizCompleted = quizIds.every(quizId => 
          completedQuizzes.includes(quizId)
        );
        
        // Determine status based on progress
        let status: "completed" | "in_progress" | "locked" = "locked";
        if (!locked) {
          status = progress >= 100 ? "completed" : "in_progress";
        }
        
        const module: TrainingModule = {
          id: moduleData.id,
          title: moduleData.name,
          description: moduleData.description,
          module: moduleData.name.toLowerCase(),
          progress,
          status,
          locked,
          videos,
          quizIds,
          totalVideos: videos.length,
          watchedVideos,
          quizCompleted
        };
        
        trainingModules.push(module);
        
        // Update for next iteration
        previousCompleted = progress >= 100;
      }
      
      setModules(trainingModules);
    } catch (err) {
      console.error('Error fetching training modules:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch modules'));
    } finally {
      setLoading(false);
    }
  }, [userId, videoProgress, completedQuizzes, calculateModuleProgress]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return {
    modules,
    loading,
    error,
    refetch: fetchModules
  };
}
