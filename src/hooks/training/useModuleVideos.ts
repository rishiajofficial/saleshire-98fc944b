
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video } from '@/types/training';

export const useModuleVideos = (moduleId: string | undefined, moduleName?: string) => {
  return useQuery({
    queryKey: ['moduleVideos', moduleId, moduleName],
    queryFn: async (): Promise<Video[]> => {
      if (!moduleId && !moduleName) {
        console.log("No moduleId or moduleName provided for video query");
        return [];
      }
      
      try {
        console.log(`Fetching videos for module: ${moduleId || moduleName}`);
        
        let videos: Video[] = [];
        
        if (moduleId) {
          // Try to get videos linked via module_videos join table
          const { data: moduleVideosData, error: moduleVideosError } = await supabase
            .from('module_videos')
            .select('video_id')
            .eq('module_id', moduleId);
          
          if (!moduleVideosError && moduleVideosData && moduleVideosData.length > 0) {
            const videoIds = moduleVideosData.map(item => item.video_id);
            
            const { data: linkedVideos, error: videoError } = await supabase
              .from('videos')
              .select('*')
              .in('id', videoIds);
              
            if (!videoError && linkedVideos) {
              videos = [...linkedVideos];
              console.log(`Found ${videos.length} videos via module_videos relation`);
            }
          }
        }
        
        // If no videos found by relation or moduleName is provided, try by module name
        if ((videos.length === 0 || moduleName) && (moduleId || moduleName)) {
          const queryModuleName = moduleName || moduleId;
          
          const { data: namedVideos, error: namedError } = await supabase
            .from('videos')
            .select('*')
            .eq('module', queryModuleName);
            
          if (!namedError && namedVideos) {
            // Combine with any already found videos, avoiding duplicates
            const existingIds = new Set(videos.map(v => v.id));
            const newVideos = namedVideos.filter(v => !existingIds.has(v.id));
            videos = [...videos, ...newVideos];
            console.log(`Found ${newVideos.length} videos via module name match`);
          }
        }
        
        return videos;
      } catch (error: any) {
        console.error("Error in moduleVideos query:", error);
        throw new Error(`Failed to fetch module videos: ${error.message}`);
      }
    },
    enabled: !!moduleId || !!moduleName
  });
};
