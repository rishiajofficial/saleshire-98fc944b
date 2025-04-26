
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
      // First get the category name to use as a fallback
      const { data: categoryData, error: categoryError } = await supabase
        .from('module_categories')
        .select('name')
        .eq('id', categoryId)
        .single();
        
      if (categoryError) {
        console.error("Error fetching category name:", categoryError);
      }
      
      const categoryName = categoryData?.name || '';
      
      // Get videos associated through category_videos table
      const { data: categoryVideos, error: categoryVideosError } = await supabase
        .from('category_videos')
        .select('video_id')
        .eq('category_id', categoryId);
      
      if (categoryVideosError) throw categoryVideosError;
      
      let allVideos: any[] = [];
      
      if (categoryVideos && categoryVideos.length > 0) {
        // Get the actual videos by IDs
        const videoIds = categoryVideos.map(item => item.video_id);
        const { data: videos, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .in('id', videoIds);
        
        if (videosError) throw videosError;
        
        if (videos) {
          allVideos = [...videos];
        }
      }
      
      // Also get videos by module name as a fallback
      if (categoryName) {
        const { data: moduleVideos, error: moduleVideosError } = await supabase
          .from('videos')
          .select('*')
          .eq('module', categoryName);
          
        if (!moduleVideosError && moduleVideos) {
          // Add videos that aren't already in the list
          const existingIds = new Set(allVideos.map(v => v.id));
          const newVideos = moduleVideos.filter(v => !existingIds.has(v.id));
          allVideos = [...allVideos, ...newVideos];
        }
      }
      
      return allVideos;
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
  },
  
  // Get user's training progress for a specific module or category
  async getUserProgress(userId: string, moduleId: string): Promise<any[]> {
    try {
      // First get the module name to use for querying by both ID and name
      const { data: moduleData, error: moduleError } = await supabase
        .from('module_categories')
        .select('name')
        .eq('id', moduleId)
        .single();
      
      if (moduleError) {
        console.error("Error fetching module name:", moduleError);
      }
      
      const moduleName = moduleData?.name || '';
      
      // Query by both module ID and module name
      const { data, error } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', userId)
        .or(`module.eq.${moduleId},module.eq.${moduleName}`)
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
