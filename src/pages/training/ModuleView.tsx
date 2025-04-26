
import React from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Loader2 } from "lucide-react";
import ModuleHeader from "@/components/training/ModuleHeader";
import VideoList from "@/components/training/VideoList";
import ModuleQuiz from "@/components/training/ModuleQuiz";
import { useModuleData } from "@/hooks/useModuleData";

const ModuleView = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { 
    moduleVideos, 
    moduleDetails, 
    videoProgressData, 
    quizResultData, 
    isLoading 
  } = useModuleData(moduleId);

  const watchedVideos = React.useMemo(() => {
    return (videoProgressData || []).map(item => item.video_id);
  }, [videoProgressData]);

  const allVideosWatched = React.useMemo(() => {
    return moduleVideos && moduleVideos.length > 0 && 
      moduleVideos.every(video => watchedVideos.includes(video.id));
  }, [moduleVideos, watchedVideos]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const formatModuleName = (name?: string) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
  };

  const progress = moduleVideos && moduleVideos.length > 0
    ? Math.round((watchedVideos.length / moduleVideos.length) * 100)
    : 0;

  return (
    <MainLayout title="Training Module">
      <div className="container mx-auto py-8">
        <ModuleHeader
          title={formatModuleName(moduleDetails?.name)}
          description={moduleDetails?.description}
          watchedCount={watchedVideos.length}
          totalVideos={moduleVideos?.length || 0}
          progress={progress}
          quizCompleted={!!quizResultData}
        />

        <VideoList
          moduleId={moduleId || ''}
          videos={moduleVideos || []}
          watchedVideos={watchedVideos}
        />

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
