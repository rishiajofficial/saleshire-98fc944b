
import React from 'react';
import { useModuleDetails } from './training/useModuleDetails';
import { useModuleVideos } from './training/useModuleVideos';
import { useVideoProgress } from './training/useVideoProgress';
import { useQuizResults } from './training/useQuizResults';
import { useAuth } from "@/contexts/AuthContext";

export const useModuleData = (moduleId: string | undefined) => {
  const { user } = useAuth();

  const { 
    data: moduleDetails, 
    isLoading: detailsLoading, 
    error: detailsError 
  } = useModuleDetails(moduleId);

  const { 
    data: moduleVideos, 
    isLoading: videosLoading, 
    error: videosError 
  } = useModuleVideos(moduleId, moduleDetails?.name);

  const { 
    data: videoProgressData, 
    isLoading: progressLoading 
  } = useVideoProgress(moduleId, moduleDetails?.name);

  const { 
    data: quizResultData, 
    isLoading: quizLoading 
  } = useQuizResults(moduleId, moduleDetails?.name);

  const error = videosError || detailsError;
  
  const finalModuleDetails = React.useMemo(() => {
    if (moduleDetails) return moduleDetails;
    
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
