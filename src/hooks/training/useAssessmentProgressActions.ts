
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAssessmentProgressActions(userId?: string) {
  const [isUpdating, setIsUpdating] = useState(false);

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

  return {
    submitAssessment,
    fetchAssessmentProgress,
    isUpdating
  };
}
