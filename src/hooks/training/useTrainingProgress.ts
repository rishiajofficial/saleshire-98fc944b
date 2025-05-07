
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Video } from '@/types/training';
import { useVideoProgressActions } from './useVideoProgressActions';
import { useAssessmentProgressActions } from './useAssessmentProgressActions';
import { useModuleProgressCalculator } from './useModuleProgressCalculator';

export function useTrainingProgress(userId?: string) {
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [videoProgress, setVideoProgress] = useState<Record<string, boolean>>({});
  const [assessmentScores, setAssessmentScores] = useState<Record<string, number>>({});
  const [completedAssessments, setCompletedAssessments] = useState<string[]>([]);

  // Import functionality from separate hooks
  const { 
    markVideoComplete: markVideoCompleteAction, 
    fetchVideoProgress,
    isUpdating: isVideoUpdating 
  } = useVideoProgressActions(effectiveUserId);
  
  const { 
    submitAssessment: submitAssessmentAction, 
    fetchAssessmentProgress,
    isUpdating: isAssessmentUpdating 
  } = useAssessmentProgressActions(effectiveUserId);

  const { calculateModuleProgress } = useModuleProgressCalculator(
    videoProgress, 
    completedAssessments
  );

  // Proxy the markVideoComplete function to update local state
  const markVideoComplete = useCallback(async (videoId: string, moduleId: string) => {
    const result = await markVideoCompleteAction(videoId, moduleId);
    if (result) {
      setVideoProgress(prev => ({
        ...prev,
        [videoId]: true
      }));
    }
    return result;
  }, [markVideoCompleteAction]);

  // Proxy the submitAssessment function to update local state
  const submitAssessment = useCallback(async (
    moduleId: string,
    score: number,
    totalQuestions: number,
    passed: boolean,
    answers?: Record<string, any>
  ) => {
    const result = await submitAssessmentAction(moduleId, score, totalQuestions, passed, answers);
    if (result) {
      if (passed) {
        setCompletedAssessments(prev => [...prev, moduleId]);
      }
      setAssessmentScores(prev => ({
        ...prev,
        [moduleId]: score
      }));
    }
    return result;
  }, [submitAssessmentAction]);

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
    isUpdating: isVideoUpdating || isAssessmentUpdating
  };
}
