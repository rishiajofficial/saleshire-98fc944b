
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

  const { data: moduleVideos, isLoading: videosLoading, error: videosError } = useQuery({
    queryKey: ['moduleVideos', moduleId],
    queryFn: async (): Promise<Video[]> => {
      if (!moduleId) return [];
      console.log("Fetching videos for module:", moduleId);
      
      // First get the category details to use the name as a fallback search
      const { data: categoryData, error: categoryError } = await supabase
        .from('module_categories')
        .select('name')
        .eq('id', moduleId)
        .maybeSingle(); // Changed from single() to maybeSingle()
        
      if (categoryError) {
        console.error("Error fetching category name:", categoryError);
        // Continue with what we have, don't throw here
      }
      
      let categoryName = categoryData?.name || '';
      console.log("Category name:", categoryName);
      
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
      
      let allVideos: Video[] = [];
      
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
      
      console.log("Final videos for module:", allVideos);
      return allVideos;
    },
    enabled: !!moduleId
  });

  const { data: moduleDetails, isLoading: detailsLoading, error: detailsError } = useQuery({
    queryKey: ['moduleDetails', moduleId],
    queryFn: async () => {
      if (!moduleId) return null;
      console.log("Fetching module details for:", moduleId);
      const { data, error } = await supabase
        .from('module_categories')
        .select('*')
        .eq('id', moduleId)
        .maybeSingle(); // Changed from single() to maybeSingle()
      
      if (error) {
        console.error("Error fetching module details:", error);
        throw error;
      }
      
      console.log("Fetched module details:", data);
      return data;
    },
    enabled: !!moduleId
  });

  const { data: videoProgressData, isLoading: progressLoading } = useQuery({
    queryKey: ['userVideoProgress', moduleId, user?.id],
    queryFn: async () => {
      if (!user || !moduleId) return [];
      
      try {
        console.log("Fetching video progress for user:", user.id, "module:", moduleId);
        const { data, error } = await supabase
          .from('training_progress')
          .select('*')
          .eq('user_id', user.id)
          .or(`module.eq.${moduleId},module.eq.${moduleDetails?.name || ''}`)
          .eq('completed', true);
        
        if (error) {
          console.error("Error fetching progress:", error);
          return [];
        }
        
        console.log("Fetched video progress:", data);
        return data || [];
      } catch (error) {
        console.error("Error in videoProgress query:", error);
        return [];
      }
    },
    enabled: !!moduleId && !!user && !!moduleDetails
  });

  const { data: quizResultData, isLoading: quizLoading } = useQuery({
    queryKey: ['userQuizResult', moduleId, user?.id],
    queryFn: async () => {
      if (!user || !moduleId) return null;
      
      try {
        console.log("Fetching quiz results for user:", user.id, "module:", moduleId);
        const { data, error } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
          .or(`module.eq.${moduleId},module.eq.${moduleDetails?.name || ''}`)
          .eq('passed', true)
          .maybeSingle(); // Changed from single() to maybeSingle()
        
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
    enabled: !!moduleId && !!user && !!moduleDetails
  });

  const error = videosError || detailsError;
  
  return {
    moduleVideos,
    moduleDetails,
    videoProgressData,
    quizResultData,
    isLoading: videosLoading || detailsLoading || progressLoading || quizLoading,
    error: error ? error.message : null
  };
};
