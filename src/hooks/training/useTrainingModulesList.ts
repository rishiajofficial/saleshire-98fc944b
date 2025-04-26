
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrainingModule, Video } from "@/types";
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
        .from('training_modules')
        .select('*')
        .order('order_index', { ascending: true });
        
      if (modulesError) throw modulesError;
      
      // Get all videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*');
      
      if (videosError) throw videosError;
      
      // Get required modules
      const { data: requiredModules, error: requiredError } = await supabase
        .from('required_modules')
        .select('*');
        
      if (requiredError) throw requiredError;
        
      // Map of module IDs to their videos
      const moduleVideosMap: Record<string, any[]> = {};
      videosData.forEach(video => {
        if (!moduleVideosMap[video.module]) {
          moduleVideosMap[video.module] = [];
        }
        moduleVideosMap[video.module].push(video);
      });
      
      // Dependencies map (which modules are required for which)
      const moduleDependencies: Record<string, string[]> = {};
      requiredModules?.forEach(req => {
        if (!moduleDependencies[req.module_id]) {
          moduleDependencies[req.module_id] = [];
        }
        moduleDependencies[req.module_id].push(req.required_module_id);
      });
      
      // Create training modules with progress info
      const trainingModules: TrainingModule[] = [];
      
      for (const moduleData of modulesData) {
        const videos = moduleVideosMap[moduleData.id] || [];
        const quizIds = moduleData.quiz_ids || [];
        
        // Calculate progress for this module
        const progress = calculateModuleProgress(videos, quizIds);
        
        // Determine if module should be locked
        let locked = false;
        if (moduleDependencies[moduleData.id]) {
          locked = moduleDependencies[moduleData.id].some(requiredModuleId => {
            const requiredModule = trainingModules.find(m => m.id === requiredModuleId);
            return requiredModule ? requiredModule.progress < 100 : true;
          });
        }
        
        // Count watched videos
        const watchedVideos = videos.filter(video => {
          const videoLen = parseFloat(video.duration || '0');
          const watched = videoProgress[video.id] || 0;
          return videoLen > 0 && watched / videoLen >= 0.9;
        }).length;
        
        // Check if quiz is completed
        const quizCompleted = quizIds.every(quizId => 
          completedQuizzes.includes(quizId)
        );
        
        // Determine status based on progress
        let status: "completed" | "in_progress" | "locked" = "locked";
        if (!locked) {
          status = progress >= 100 ? "completed" : "in_progress";
        }
        
        trainingModules.push({
          id: moduleData.id,
          title: moduleData.title,
          description: moduleData.description,
          module: moduleData.module,
          progress,
          status,
          locked,
          videos,
          quizIds,
          totalVideos: videos.length,
          watchedVideos,
          quizCompleted
        });
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
