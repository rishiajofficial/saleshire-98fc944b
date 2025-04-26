
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Video } from "@/types/training";

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
      .from('training_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true);

    // Build video progress lookup
    const videoProgressLookup: Record<string, number> = {};
    videoProgressData?.forEach(item => {
      videoProgressLookup[item.video_id] = 0; // Since we're tracking completion, not seconds
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
      quizScoresLookup[item.module] = item.score || 0; // Using module as key instead of quiz_id
      if (item.passed) {
        completedQuizIds.push(item.module);
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
    
    // Count completed videos
    let completedItems = 0;
    const totalItems = videos.length + quizIds.length;
    
    videos.forEach(video => {
      if (videoProgress[video.id]) {
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
