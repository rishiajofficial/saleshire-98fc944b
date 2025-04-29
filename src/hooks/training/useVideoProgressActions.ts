
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useVideoProgressActions(userId?: string) {
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

  return {
    markVideoComplete,
    fetchVideoProgress,
    isUpdating
  };
}
