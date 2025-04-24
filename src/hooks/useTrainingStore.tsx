
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface TrainingProgress {
  video_id: string;
  completed: boolean;
  module: string;
  completed_at?: string;
}

interface QuizResult {
  module: string;
  score: number;
  total_questions: number;
  passed: boolean;
  answers: Record<string, string>;
}

export const useTrainingStore = (moduleId?: string) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateVideoProgress = useCallback(async (videoId: string, completed: boolean = true) => {
    if (!user || !moduleId) return;
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('training_progress')
        .upsert({
          user_id: user.id,
          video_id: videoId,
          module: moduleId,
          completed,
          completed_at: completed ? new Date().toISOString() : null
        });

      if (error) throw error;
      
      toast.success('Progress updated successfully');
    } catch (error: any) {
      console.error('Error updating video progress:', error);
      toast.error('Failed to update progress');
    } finally {
      setIsUpdating(false);
    }
  }, [user, moduleId]);

  const submitQuizResults = useCallback(async (results: Omit<QuizResult, 'module'>) => {
    if (!user || !moduleId) return;
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('quiz_results')
        .insert({
          user_id: user.id,
          module: moduleId,
          score: results.score,
          total_questions: results.total_questions,
          passed: results.passed,
          answers: results.answers,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success('Quiz results saved successfully');
    } catch (error: any) {
      console.error('Error saving quiz results:', error);
      toast.error('Failed to save quiz results');
    } finally {
      setIsUpdating(false);
    }
  }, [user, moduleId]);

  return {
    updateVideoProgress,
    submitQuizResults,
    isUpdating
  };
};
