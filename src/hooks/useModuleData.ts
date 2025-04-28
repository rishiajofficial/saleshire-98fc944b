
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Video {
  id: string;
  title: string;
  description: string | null;
  url: string;
  duration: string;
  module: string;
}

export const useModuleData = (moduleId: string | undefined) => {
  const { user } = useAuth();

  const { data: moduleDetails, isLoading: detailsLoading, error: detailsError } = useQuery({
    queryKey: ['moduleDetails', moduleId],
    queryFn: async () => {
      if (!moduleId) return null;
      console.log("Fetching module details for:", moduleId);
      
      try {
        // First try to get the module by ID
        const { data, error } = await supabase
          .from('module_categories')
          .select('*')
          .eq('id', moduleId)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching module details:", error);
          throw error;
        }
        
        console.log("Fetched module details:", data);
        
        // If we didn't find the module by ID, log an error
        if (!data) {
          console.error(`Module with ID ${moduleId} not found`);
        }
        
        return data;
      } catch (error) {
        console.error("Error in moduleDetails query:", error);
        return null;
      }
    },
    enabled: !!moduleId
  });

  const { data: moduleVideos, isLoading: videosLoading, error: videosError } = useQuery({
    queryKey: ['moduleVideos', moduleId, moduleDetails?.name],
    queryFn: async (): Promise<Video[]> => {
      if (!moduleId) return [];
      console.log("Fetching videos for module:", moduleId);
      
      try {
        // Use the module details if we have them
        let categoryName = moduleDetails?.name || '';
        console.log("Category name:", categoryName);
        
        let allVideos: Video[] = [];
        
        // Get videos through category_videos associations
        const { data: categoryVideosData, error: categoryVideosError } = await supabase
          .from('category_videos')
          .select('video_id')
          .eq('category_id', moduleId);
          
        if (categoryVideosError) {
          console.error("Error fetching category videos:", categoryVideosError);
          throw categoryVideosError;
        }
        
        console.log("Category videos data:", categoryVideosData);
        
        if (categoryVideosData && categoryVideosData.length > 0) {
          const videoIds = categoryVideosData.map(item => item.video_id);
          console.log("Found video IDs from category_videos:", videoIds);
          
          const { data: videosData, error: videosError } = await supabase
            .from('videos')
            .select('*')
            .in('id', videoIds);
          
          if (videosError) {
            console.error("Error fetching videos by IDs:", videosError);
            throw videosError;
          }
          
          if (videosData) {
            console.log("Videos fetched by IDs:", videosData);
            allVideos = [...videosData];
          }
        }
        
        // Also fetch videos by module name match as a fallback
        if (categoryName) {
          const { data: moduleVideosData, error: moduleVideosError } = await supabase
            .from('videos')
            .select('*')
            .eq('module', categoryName);
          
          if (moduleVideosError) {
            console.error("Error fetching videos by module name:", moduleVideosError);
          } else if (moduleVideosData) {
            console.log("Videos fetched by module name:", moduleVideosData);
            // Add videos that aren't already in the list
            const existingIds = new Set(allVideos.map(v => v.id));
            const newVideos = moduleVideosData.filter(v => !existingIds.has(v.id));
            allVideos = [...allVideos, ...newVideos];
          }
        }
        
        // If we don't have a name from moduleDetails, try another approach
        if (!categoryName && allVideos.length === 0) {
          // Try to fetch videos directly by module ID as a fallback
          console.log("Attempting to fetch videos directly by module param:", moduleId);
          const { data: directVideosData, error: directVideosError } = await supabase
            .from('videos')
            .select('*')
            .eq('module', moduleId);
            
          if (!directVideosError && directVideosData && directVideosData.length > 0) {
            console.log("Videos fetched directly by module param:", directVideosData);
            allVideos = [...directVideosData];
          }
        }
        
        console.log("Final videos for module:", allVideos);
        return allVideos;
      } catch (error) {
        console.error("Error fetching module videos:", error);
        return [];
      }
    },
    enabled: !!moduleId,
    // Wait for moduleDetails before fetching videos so we have the module name
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: videoProgressData, isLoading: progressLoading } = useQuery({
    queryKey: ['userVideoProgress', moduleId, user?.id, moduleDetails?.name],
    queryFn: async () => {
      if (!user || !moduleId) return [];
      
      try {
        console.log("Fetching video progress for user:", user.id, "module:", moduleId);
        const { data, error } = await supabase
          .from('training_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', true);
        
        if (error) {
          console.error("Error fetching progress:", error);
          return [];
        }
        
        // Filter the progress to only include videos for this module
        let relevantProgress = data || [];
        
        // If we have moduleDetails with name, filter by that too
        if (moduleDetails?.name) {
          relevantProgress = relevantProgress.filter(
            item => item.module === moduleId || item.module === moduleDetails.name
          );
        }
        
        console.log("Fetched video progress:", relevantProgress);
        return relevantProgress;
      } catch (error) {
        console.error("Error in videoProgress query:", error);
        return [];
      }
    },
    enabled: !!moduleId && !!user
  });

  const { data: quizResultData, isLoading: quizLoading } = useQuery({
    queryKey: ['userQuizResult', moduleId, user?.id, moduleDetails?.name],
    queryFn: async () => {
      if (!user || !moduleId) return null;
      
      try {
        console.log("Fetching quiz results for user:", user.id, "module:", moduleId);
        
        // Try to find quiz results by moduleId or module name
        let query = supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
          .eq('passed', true);
          
        if (moduleDetails?.name) {
          query = query.or(`module.eq.${moduleId},module.eq.${moduleDetails.name}`);
        } else {
          query = query.eq('module', moduleId);
        }
        
        const { data, error } = await query.maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching quiz results:", error);
        }
        
        console.log("Fetched quiz results:", data);
        return data;
      } catch (error) {
        console.error("Error in quiz results query:", error);
        return null;
      }
    },
    enabled: !!moduleId && !!user
  });

  const error = videosError || detailsError;
  
  // If module details is null but we have videos, try to construct a fallback module object
  const finalModuleDetails = React.useMemo(() => {
    if (moduleDetails) return moduleDetails;
    
    // If we have videos but no module details, create a fallback module object
    if (moduleVideos && moduleVideos.length > 0) {
      const firstVideo = moduleVideos[0];
      return {
        id: moduleId,
        name: firstVideo.module,
        description: `Videos for ${firstVideo.module}`,
        quiz_ids: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user?.id
      };
    }
    
    return null;
  }, [moduleDetails, moduleVideos, moduleId, user]);
  
  return {
    moduleVideos,
    moduleDetails: finalModuleDetails,
    videoProgressData,
    quizResultData,
    isLoading: videosLoading || detailsLoading || progressLoading || quizLoading,
    error: error ? error.message : null
  };
};
