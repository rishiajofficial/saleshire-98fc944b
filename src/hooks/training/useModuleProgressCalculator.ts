
import { useCallback } from 'react';
import { Video } from '@/types/training';

export function useModuleProgressCalculator(
  videoProgress: Record<string, boolean>,
  completedAssessments: string[]
) {
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

  return { calculateModuleProgress };
}
