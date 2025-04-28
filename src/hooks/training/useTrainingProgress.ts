import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrainingModule, Video, Assessment } from "@/types/training";

interface TrainingModuleProgress {
  moduleId: string;
  videoProgress: Record<string, boolean>;
  assessmentScores: Record<string, number>;
  completedAssessments: string[];
  completed: boolean;
}

export function useTrainingProgress(userId?: string) {
  const [trainingModules, setTrainingModules] = useState<TrainingModuleProgress[]>([]);
  const [videoProgress, setVideoProgress] = useState<Record<string, boolean>>({});
  const [assessmentScores, setAssessmentScores] = useState<Record<string, number>>({});
  const [completedAssessments, setCompletedAssessments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchTrainingData = useCallback(async () => {
    if (!userId) {
      console.log("Not fetching training data: no user ID");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Fetch all video progress for the user
      const { data: videoProgressData, error: videoProgressError } = await supabase
        .from('user_video_progress')
        .select('*')
        .eq('user_id', userId);

      if (videoProgressError) throw videoProgressError;

      // Transform video progress data into a simple boolean map
      const initialVideoProgress: Record<string, boolean> = {};
      videoProgressData?.forEach(item => {
        initialVideoProgress[item.video_id] = item.completed;
      });
      setVideoProgress(initialVideoProgress);

      // Fetch all assessment scores for the user
      const { data: assessmentScoresData, error: assessmentScoresError } = await supabase
        .from('user_assessment_scores')
        .select('*')
        .eq('user_id', userId);

      if (assessmentScoresError) throw assessmentScoresError;

      // Transform assessment scores data into a simple score map
      const initialAssessmentScores: Record<string, number> = {};
      const initialCompletedAssessments: string[] = [];
      assessmentScoresData?.forEach(item => {
        initialAssessmentScores[item.assessment_id] = item.score;
        if (item.passed) {
          initialCompletedAssessments.push(item.assessment_id);
        }
      });
      setAssessmentScores(initialAssessmentScores);
      setCompletedAssessments(initialCompletedAssessments);

    } catch (err: any) {
      console.error("Error fetching training data:", err);
      setError(err.message || "Failed to fetch training data");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTrainingData();
  }, [fetchTrainingData]);

  const markVideoAsComplete = async (videoId: string) => {
    if (!userId) {
      toast.error("You must be logged in to track progress");
      return;
    }

    setVideoProgress(prev => ({ ...prev, [videoId]: true }));

    const { error } = await supabase
      .from('user_video_progress')
      .upsert(
        { user_id: userId, video_id: videoId, completed: true },
        { onConflict: 'user_id, video_id', ignoreDuplicates: false }
      );

    if (error) {
      console.error("Error marking video as complete:", error);
      toast.error("Failed to save video progress");
      // Revert local state on error
      setVideoProgress(prev => ({ ...prev, [videoId]: false }));
    }
  };

  const submitAssessment = async (assessmentId: string, score: number, passed: boolean) => {
    if (!userId) {
      toast.error("You must be logged in to submit assessments");
      return;
    }

    setAssessmentScores(prev => ({ ...prev, [assessmentId]: score }));
    if (passed) {
      setCompletedAssessments(prev => [...prev, assessmentId]);
    }

    const { error } = await supabase
      .from('user_assessment_scores')
      .upsert(
        { user_id: userId, assessment_id: assessmentId, score: score, passed: passed },
        { onConflict: 'user_id, assessment_id', ignoreDuplicates: false }
      );

    if (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
      // Revert local state on error
      setAssessmentScores(prev => {
        const newState = { ...prev };
        delete newState[assessmentId];
        return newState;
      });
      setCompletedAssessments(prev => prev.filter(id => id !== assessmentId));
    }
  };

  const calculateModuleProgress = (videos: Video[], quizIds: string[]): number => {
    const totalContent = videos.length + quizIds.length;
    if (totalContent === 0) return 100; // If no content, consider it complete

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

    return (completedCount / totalContent) * 100;
  };

  const refetch = () => {
    fetchTrainingData();
  };

  return {
    trainingModules,
    videoProgress,
    assessmentScores,
    completedAssessments,
    isLoading,
    error,
    markVideoAsComplete,
    submitAssessment,
    calculateModuleProgress,
    refetch
  };
}
