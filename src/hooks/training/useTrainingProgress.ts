
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Video } from '@/types/training';

export function useTrainingProgress(userId?: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [videoProgress, setVideoProgress] = useState<Record<string, boolean>>({});
  const [assessmentScores, setAssessmentScores] = useState<Record<string, number>>({});
  const [completedAssessments, setCompletedAssessments] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Function to mark a video as complete
  const markVideoComplete = useCallback(async (videoId: string, moduleId: string) => {
    if (!userId || !videoId) return false;
    
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('training_progress')
        .upsert({
          user_id: userId,
          video_id: videoId,
          module: moduleId,
          completed: true,
          completed_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update local state
      setVideoProgress(prev => ({
        ...prev,
        [videoId]: true
      }));
      
      return true;
    } catch (err: any) {
      console.error("Error marking video complete:", err);
      toast.error("Failed to update video progress");
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [userId]);

  // Function to fetch video progress
  const fetchVideoProgress = useCallback(async () => {
    if (!userId) return {};
    
    try {
      const { data, error } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true);
      
      if (error) throw error;
      
      const progressMap: Record<string, boolean> = {};
      if (data) {
        data.forEach(item => {
          progressMap[item.video_id] = true;
        });
      }
      
      return progressMap;
    } catch (err: any) {
      console.error("Error fetching video progress:", err);
      return {};
    }
  }, [userId]);

  // Function to submit an assessment
  const submitAssessment = useCallback(async (
    moduleId: string,
    score: number,
    totalQuestions: number,
    passed: boolean,
    answers?: Record<string, any>
  ) => {
    if (!userId) {
      toast.error("User authentication required");
      return false;
    }

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('quiz_results')
        .upsert({
          user_id: userId,
          module: moduleId,
          score,
          total_questions: totalQuestions,
          passed,
          answers,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Update local state
      if (passed) {
        setCompletedAssessments(prev => [...prev, moduleId]);
      }
      setAssessmentScores(prev => ({
        ...prev,
        [moduleId]: score
      }));
      
      return true;
    } catch (err: any) {
      console.error("Error submitting assessment:", err);
      toast.error("Failed to submit assessment");
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [userId]);

  // Function to fetch assessment progress
  const fetchAssessmentProgress = useCallback(async () => {
    if (!userId) return { scores: {}, completed: [] };

    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const scores: Record<string, number> = {};
      const completed: string[] = [];

      (data || []).forEach((item: any) => {
        scores[item.module] = item.score;
        if (item.passed) {
          completed.push(item.module);
        }
      });

      return { scores, completed };
    } catch (err) {
      console.error("Error fetching assessment progress:", err);
      return { scores: {}, completed: [] };
    }
  }, [userId]);

  const fetchTrainingData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const [videoProgressData, assessmentProgressData] = await Promise.all([
        fetchVideoProgress(),
        fetchAssessmentProgress()
      ]);

      setVideoProgress(videoProgressData);
      setAssessmentScores(assessmentProgressData.scores);
      setCompletedAssessments(assessmentProgressData.completed);
    } catch (err: any) {
      console.error("Error fetching training data:", err);
      setError(err.message || "Failed to fetch training data");
    } finally {
      setIsLoading(false);
    }
  }, [fetchVideoProgress, fetchAssessmentProgress]);

  useEffect(() => {
    fetchTrainingData();
  }, [fetchTrainingData]);

  const calculateModuleProgress = useCallback((videos: Video[], quizIds: string[]): number => {
    const totalContent = videos.length + quizIds.length;
    if (totalContent === 0) return 100;

    let completedCount = 0;
    videos.forEach(video => {
      if (videoProgress[video.id]) {
        completedCount++;
      }
    });
    quizIds.forEach(quizId => {
      if (completedAssessments.includes(quizId)) {
        completedCount++;
      }
    });

    return Math.round((completedCount / totalContent) * 100);
  }, [videoProgress, completedAssessments]);

  return {
    videoProgress,
    assessmentScores,
    completedAssessments,
    isLoading,
    error,
    markVideoComplete,
    submitAssessment,
    calculateModuleProgress,
    refetch: fetchTrainingData,
    isUpdating
  };
}
