
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Loader2 } from "lucide-react";
import ModuleHeader from "@/components/training/ModuleHeader";
import VideoList from "@/components/training/VideoList";
import ModuleQuiz from "@/components/training/ModuleQuiz";
import { useModuleData } from "@/hooks/useModuleData";
import { toast } from "sonner";

const ModuleView = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { 
    moduleVideos, 
    moduleDetails, 
    videoProgressData, 
    quizResultData, 
    isLoading,
    error 
  } = useModuleData(moduleId);

  const watchedVideos = React.useMemo(() => {
    if (!videoProgressData) return [];
    return videoProgressData.map(item => item.video_id);
  }, [videoProgressData]);

  const allVideosWatched = React.useMemo(() => {
    return moduleVideos && moduleVideos.length > 0 && 
      moduleVideos.every(video => watchedVideos.includes(video.id));
  }, [moduleVideos, watchedVideos]);

  useEffect(() => {
    console.log("ModuleView rendered with:", {
      moduleId,
      moduleVideos: moduleVideos || [],
      moduleDetails: moduleDetails || null,
      videoProgressData: videoProgressData || [],
      watchedVideos: watchedVideos || []
    });
    
    if (error) {
      toast.error("Failed to load module data: " + error);
    }
  }, [error, moduleId, moduleVideos, moduleDetails, videoProgressData, watchedVideos]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!moduleDetails) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 text-center">
          <h2 className="text-2xl font-semibold">Module Not Found</h2>
          <p className="text-gray-500 mt-2">The requested training module could not be found.</p>
        </div>
      </MainLayout>
    );
  }

  const formatModuleName = (name?: string) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
  };

  const totalVideos = moduleVideos?.length || 0;
  const watchedCount = watchedVideos?.length || 0;
  
  console.log("Module videos count:", totalVideos);
  console.log("Watched videos count:", watchedCount);
  
  const progress = totalVideos > 0
    ? Math.round((watchedCount / totalVideos) * 100)
    : 0;

  return (
    <MainLayout title="Training Module">
      <div className="container mx-auto py-8">
        <ModuleHeader
          title={formatModuleName(moduleDetails?.name)}
          description={moduleDetails?.description}
          watchedCount={watchedCount}
          totalVideos={totalVideos}
          progress={progress}
          quizCompleted={!!quizResultData}
        />

        {moduleVideos && moduleVideos.length > 0 ? (
          <VideoList
            moduleId={moduleId || ''}
            videos={moduleVideos}
            watchedVideos={watchedVideos}
          />
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg border">
            <p className="text-gray-500">No videos available for this module.</p>
          </div>
        )}

        <div className="mt-6">
          <ModuleQuiz
            moduleId={moduleId || ''}
            quizIds={moduleDetails?.quiz_ids}
            allVideosWatched={allVideosWatched}
            quizCompleted={!!quizResultData}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default ModuleView;
