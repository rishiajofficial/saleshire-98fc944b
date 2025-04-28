
import { useState, useEffect, useCallback } from 'react';
import { useVideoProgress } from './useVideoProgress';
import { useAssessmentProgress } from './useAssessmentProgress';
import { Video } from '@/types/training';

export function useTrainingProgress(userId?: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [videoProgress, setVideoProgress] = useState<Record<string, boolean>>({});
  const [assessmentScores, setAssessmentScores] = useState<Record<string, number>>({});
  const [completedAssessments, setCompletedAssessments] = useState<string[]>([]);

  const { 
    markVideoComplete, 
    fetchVideoProgress,
    isUpdating: updatingVideo 
  } = useVideoProgress(userId);

  const { 
    submitAssessment, 
    fetchAssessmentProgress,
    isUpdating: updatingAssessment 
  } = useAssessmentProgress(userId);

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
    isUpdating: updatingVideo || updatingAssessment
  };
}
