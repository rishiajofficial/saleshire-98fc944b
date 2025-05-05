
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VideoData {
  id?: string;
  title: string;
  description?: string;
  url: string;
  duration: string;
  module: string;
}

export const TrainingService = {
  // Get user's training progress for a specific module
  async getUserProgress(userId: string, moduleId: string): Promise<any[]> {
    try {
      // Query by module ID
      const { data, error } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('module', moduleId)
        .eq('completed', true);
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error: any) {
      console.error("Error fetching user progress:", error);
      return [];
    }
  }
};

export default TrainingService;
