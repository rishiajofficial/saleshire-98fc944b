
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
  // Get videos for a category
  async getVideosForCategory(categoryId: string): Promise<any[]> {
    try {
      // Get videos associated through category_videos table
      const { data: categoryVideos, error: categoryVideosError } = await supabase
        .from('category_videos')
        .select('video_id')
        .eq('category_id', categoryId);
      
      if (categoryVideosError) throw categoryVideosError;
      
      if (!categoryVideos || categoryVideos.length === 0) {
        return [];
      }
      
      // Get the actual videos
      const videoIds = categoryVideos.map(item => item.video_id);
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .in('id', videoIds);
      
      if (videosError) throw videosError;
      
      return videos || [];
    } catch (error: any) {
      console.error("Error fetching videos for category:", error);
      return [];
    }
  },
  
  // Associate a video with a category
  async linkVideoToCategory(videoId: string, categoryId: string): Promise<boolean> {
    try {
      // Check if the association already exists
      const { data: existing, error: checkError } = await supabase
        .from('category_videos')
        .select('*')
        .eq('video_id', videoId)
        .eq('category_id', categoryId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      // Only create if it doesn't exist
      if (!existing) {
        const { error } = await supabase
          .from('category_videos')
          .insert({
            video_id: videoId,
            category_id: categoryId
          });
        
        if (error) throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error("Error linking video to category:", error);
      toast.error(`Failed to associate video with category: ${error.message}`);
      return false;
    }
  },
  
  // Remove association between video and category
  async unlinkVideoFromCategory(videoId: string, categoryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('category_videos')
        .delete()
        .eq('video_id', videoId)
        .eq('category_id', categoryId);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error("Error unlinking video from category:", error);
      toast.error(`Failed to remove video from category: ${error.message}`);
      return false;
    }
  }
};

export default TrainingService;
