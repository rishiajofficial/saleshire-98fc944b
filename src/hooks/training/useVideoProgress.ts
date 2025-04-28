
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VideoProgressData } from '@/types/training-progress';

export const useVideoProgress = (userId?: string) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const markVideoComplete = useCallback(async (
    videoId: string, 
    moduleId: string,
    completed: boolean = true
  ) => {
    if (!userId) {
      toast.error("User authentication required");
      return false;
    }

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('training_progress')
        .upsert({
          user_id: userId,
          video_id: videoId,
          module: moduleId,
          completed,
          completed_at: completed ? new Date().toISOString() : null
        });

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error("Error updating video progress:", err);
      toast.error("Failed to update video progress");
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [userId]);

  const fetchVideoProgress = useCallback(async () => {
    if (!userId) return {};

    try {
      const { data, error } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true);

      if (error) throw error;

      const progress: Record<string, boolean> = {};
      data?.forEach((item: VideoProgressData) => {
        progress[item.video_id] = item.completed;
      });

      return progress;
    } catch (err) {
      console.error("Error fetching video progress:", err);
      return {};
    }
  }, [userId]);

  return {
    markVideoComplete,
    fetchVideoProgress,
    isUpdating
  };
};
