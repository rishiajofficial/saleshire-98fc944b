
import React from 'react';
import { useModuleVideos } from './training/useModuleVideos';
import { useVideoProgress } from './training/useVideoProgress';
import { useQuizResults } from './training/useQuizResults';
import { useAuth } from "@/contexts/AuthContext";

export const useModuleData = (moduleId: string | undefined) => {
  const { user } = useAuth();

  // We no longer need module details as module_categories table is removed
  // Create a simpler module details object from the videos data

  const { 
    data: moduleVideos, 
    isLoading: videosLoading, 
    error: videosError 
  } = useModuleVideos(moduleId);

  const { 
    data: videoProgressData, 
    isLoading: progressLoading 
  } = useVideoProgress(moduleId);

  const { 
    data: quizResultData, 
    isLoading: quizLoading 
  } = useQuizResults(moduleId);

  const error = videosError;
  
  const finalModuleDetails = React.useMemo(() => {
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
  }, [moduleVideos, moduleId, user]);
  
  return {
    moduleVideos,
    moduleDetails: finalModuleDetails,
    videoProgressData,
    quizResultData,
    isLoading: videosLoading || progressLoading || quizLoading,
    error: error ? error.message : null
  };
};
