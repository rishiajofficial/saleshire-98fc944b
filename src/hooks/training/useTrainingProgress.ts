
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrainingModule, Video } from "@/types";

export function useTrainingProgress(userId?: string) {
  const [moduleProgress, setModuleProgress] = useState<Record<string, number>>({});
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);

  // Fetch all progress data when userId changes
  const fetchProgressData = useCallback(async () => {
    if (!userId) return;
    
    // Get video progress data
    const { data: videoProgressData } = await supabase
      .from('video_progress')
      .select('*')
      .eq('user_id', userId);

    // Build video progress lookup
    const videoProgressLookup: Record<string, number> = {};
    videoProgressData?.forEach(item => {
      videoProgressLookup[item.video_id] = item.progress_seconds || 0;
    });
    setVideoProgress(videoProgressLookup);
    
    // Get quiz scores
    const { data: quizData } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId);

    // Build quiz scores lookup and track completed quizzes
    const quizScoresLookup: Record<string, number> = {};
    const completedQuizIds: string[] = [];
    quizData?.forEach(item => {
      quizScoresLookup[item.quiz_id] = item.score || 0;
      if (item.completed) {
        completedQuizIds.push(item.quiz_id);
      }
    });
    setQuizScores(quizScoresLookup);
    setCompletedQuizzes(completedQuizIds);
    
  }, [userId]);
  
  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);
  
  // Calculate module progress based on video progress and quiz completion
  const calculateModuleProgress = useCallback((
    videos: Video[],
    quizIds: string[] = []
  ) => {
    if (!videos.length && !quizIds.length) return 0;
    
    // Count completed videos (watched more than 90%)
    let completedItems = 0;
    const totalItems = videos.length + quizIds.length;
    
    videos.forEach(video => {
      const videoLen = parseFloat(video.duration || '0');
      const watched = videoProgress[video.id] || 0;
      
      // If watched more than 90% of video
      if (videoLen > 0 && watched / videoLen >= 0.9) {
        completedItems++;
      }
    });
    
    // Add completed quizzes
    quizIds.forEach(quizId => {
      if (completedQuizzes.includes(quizId)) {
        completedItems++;
      }
    });
    
    return totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
  }, [videoProgress, completedQuizzes]);
  
  return {
    videoProgress,
    quizScores,
    completedQuizzes,
    calculateModuleProgress,
    fetchProgressData
  };
}
