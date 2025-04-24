import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Video, BookOpen, CheckCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Video {
  id: string;
  title: string;
  description: string | null;
  url: string;
  duration: string;
  module: string;
}

interface Progress {
  video_id: string;
  completed: boolean;
}

const ModuleView = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);

  const { data: moduleVideos, isLoading: videosLoading } = useQuery({
    queryKey: ['moduleVideos', moduleId],
    queryFn: async (): Promise<Video[]> => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('module', moduleId)
        .order('created_at');
      
      if (error) {
        toast.error(`Error fetching videos: ${error.message}`);
        throw error;
      }
      return data || [];
    },
    enabled: !!moduleId
  });

  const { data: moduleDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['moduleDetails', moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .eq('module', moduleId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        toast.error(`Error fetching module details: ${error.message}`);
        throw error;
      }
      return data;
    },
    enabled: !!moduleId
  });

  useEffect(() => {
    const checkProgress = async () => {
      try {
        if (!user || !moduleId) return;
        const { data } = await supabase
          .from('training_progress')
          .select('*')
          .limit(1);
          
        console.log("Training progress table check:", data);
      } catch (error) {
        console.error("Error checking training_progress table:", error);
      }
    };
    
    checkProgress();
  }, [user, moduleId]);

  const { data: videoProgressData } = useQuery({
    queryKey: ['userVideoProgress', moduleId, user?.id],
    queryFn: async () => {
      if (!user || !moduleId) return [];
      
      try {
        const { data, error } = await supabase
          .from('training_progress')
          .select('video_id')
          .eq('user_id', user.id)
          .eq('module', moduleId)
          .eq('completed', true);
        
        if (error) {
          console.error("Error fetching progress:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Error in videoProgress query:", error);
        return [];
      }
    },
    enabled: !!moduleId && !!user,
    meta: {
      onSuccess: (data: { video_id: string }[]) => {
        setWatchedVideos(data.map(item => item.video_id));
      }
    }
  });

  const allVideosWatched = React.useMemo(() => {
    return moduleVideos && moduleVideos.length > 0 && 
      moduleVideos.every(video => watchedVideos.includes(video.id));
  }, [moduleVideos, watchedVideos]);

  const formatModuleName = (name?: string) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
  };

  if (videosLoading || detailsLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!moduleVideos || moduleVideos.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Button
            variant="outline"
            className="mb-6"
            onClick={() => navigate('/training')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Training
          </Button>

          <div className="text-center p-12">
            <h2 className="text-2xl font-semibold mb-4">No videos found for this module</h2>
            <p className="text-gray-500 mb-4">There are currently no training videos available for this module.</p>
            <Button onClick={() => navigate('/training')}>Return to Training</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate('/training')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Training
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">{formatModuleName(moduleId)} Training Module</h1>
          <p className="text-muted-foreground mt-2">
            Complete all videos to unlock the assessment
          </p>
        </div>

        <div className="grid gap-6">
          {moduleVideos?.map((video) => {
            const isWatched = watchedVideos.includes(video.id);
            
            return (
              <Card key={video.id} className={isWatched ? "border-green-200" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Video className="h-5 w-5 mr-2 text-primary" />
                    {video.title}
                    {isWatched && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                    )}
                  </CardTitle>
                  {video.description && (
                    <CardDescription>{video.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Duration: {video.duration}
                      {isWatched && <span className="ml-2 text-green-500">Completed</span>}
                    </div>
                    <Button asChild>
                      <Link to={`/training/video/${moduleId}/${video.id}`}>
                        <Play className="h-4 w-4 mr-2" /> {isWatched ? "Rewatch Video" : "Watch Video"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {moduleDetails?.quiz_id && (
            <Card className={`border-primary ${!allVideosWatched ? "opacity-75" : ""}`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Module Assessment
                </CardTitle>
                <CardDescription>
                  {allVideosWatched 
                    ? "You've completed all videos! Take the assessment to test your knowledge."
                    : "Complete all videos above to unlock this assessment"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild disabled={!allVideosWatched}>
                  <Link to={allVideosWatched ? `/training/quiz/${moduleId}` : "#"}>
                    {allVideosWatched ? "Start Assessment" : "Complete All Videos First"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ModuleView;
