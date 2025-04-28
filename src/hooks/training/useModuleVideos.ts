
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video } from "@/types/training";

export const useModuleVideos = (moduleId: string | undefined, moduleName?: string) => {
  return useQuery({
    queryKey: ['moduleVideos', moduleId, moduleName],
    queryFn: async (): Promise<Video[]> => {
      if (!moduleId) return [];
      console.log("Fetching videos for module:", moduleId);
      
      try {
        let categoryName = moduleName || '';
        console.log("Category name:", categoryName);
        
        let allVideos: Video[] = [];
        
        const { data: categoryVideosData, error: categoryVideosError } = await supabase
          .from('category_videos')
          .select('video_id')
          .eq('category_id', moduleId);
          
        if (categoryVideosError) {
          console.error("Error fetching category videos:", categoryVideosError);
          throw categoryVideosError;
        }
        
        if (categoryVideosData && categoryVideosData.length > 0) {
          const videoIds = categoryVideosData.map(item => item.video_id);
          const { data: videosData, error: videosError } = await supabase
            .from('videos')
            .select('*')
            .in('id', videoIds);
          
          if (videosError) throw videosError;
          if (videosData) allVideos = [...videosData];
        }
        
        if (categoryName) {
          const { data: moduleVideosData, error: moduleVideosError } = await supabase
            .from('videos')
            .select('*')
            .eq('module', categoryName);
          
          if (!moduleVideosError && moduleVideosData) {
            const existingIds = new Set(allVideos.map(v => v.id));
            const newVideos = moduleVideosData.filter(v => !existingIds.has(v.id));
            allVideos = [...allVideos, ...newVideos];
          }
        }
        
        if (!categoryName && allVideos.length === 0) {
          const { data: directVideosData } = await supabase
            .from('videos')
            .select('*')
            .eq('module', moduleId);
            
          if (directVideosData) {
            allVideos = [...directVideosData];
          }
        }
        
        return allVideos;
      } catch (error) {
        console.error("Error fetching module videos:", error);
        return [];
      }
    },
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000
  });
};
