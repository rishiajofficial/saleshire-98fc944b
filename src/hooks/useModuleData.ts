
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
      
      const { data: categoryVideosData, error: categoryVideosError } = await supabase
        .from('category_videos')
        .select('video_id')
        .eq('category_id', moduleId);
        
      if (categoryVideosError) {
        console.error("Error fetching category videos:", categoryVideosError);
        throw categoryVideosError;
      }
      
      if (!categoryVideosData || categoryVideosData.length === 0) {
        return [];
      }
      
      const videoIds = categoryVideosData.map(item => item.video_id);
      console.log("Found video IDs:", videoIds);
      
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .in('id', videoIds);
      
      if (videosError) {
        console.error("Error fetching videos:", videosError);
        throw videosError;
      }
      
      console.log("Fetched videos:", videosData);
      return videosData || [];
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
        .single();
      
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
          .eq('module', moduleId)
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
    enabled: !!moduleId && !!user
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
          .eq('module', moduleId)
          .eq('passed', true)
          .maybeSingle();
        
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
  
  return {
    moduleVideos,
    moduleDetails,
    videoProgressData,
    quizResultData,
    isLoading: videosLoading || detailsLoading || progressLoading || quizLoading,
    error: error ? error.message : null
  };
};
