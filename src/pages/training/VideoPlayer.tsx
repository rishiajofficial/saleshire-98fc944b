import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle, PlayCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const VideoPlayer = () => {
  const { moduleId, videoId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const queryClient = useQueryClient();

  const nextVideoId = searchParams.get('next');

  const { data: video, isLoading: isLoadingVideo } = useQuery({
    queryKey: ['video-details', videoId],
    queryFn: async () => {
      if (!videoId) throw new Error("Video ID is required");
      
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();
        
      if (error) throw error;
      
      return data;
    },
    enabled: !!videoId
  });

  const { data: module } = useQuery({
    queryKey: ['module-details', moduleId],
    queryFn: async () => {
      if (!moduleId) throw new Error("Module ID is required");
      
      let query = supabase
        .from('training_modules')
        .select('*');
        
      if (moduleId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        query = query.eq('id', moduleId);
      } else {
        query = query.eq('module', moduleId);
      }
      
      const { data, error } = await query.single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!moduleId
  });

  const { data: moduleVideos } = useQuery({
    queryKey: ['module-videos', moduleId],
    queryFn: async () => {
      if (!moduleId) throw new Error("Module ID is required");
      
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('module', moduleId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!moduleId
  });

  const { data: progressData } = useQuery({
    queryKey: ['video-progress', user?.id, videoId],
    queryFn: async () => {
      if (!user?.id || !videoId) throw new Error("User ID and Video ID are required");
      
      return { completed: false, progress: 0 };
    },
    enabled: !!user && !!videoId
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      videoId, 
      progress, 
      completed 
    }: { 
      userId: string; 
      videoId: string; 
      progress: number; 
      completed: boolean 
    }) => {
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-progress', user?.id, videoId] });
      queryClient.invalidateQueries({ queryKey: ['training-modules'] });
    },
  });

  useEffect(() => {
    if (progressData && videoRef.current && !videoCompleted) {
      const videoElement = videoRef.current;
      if (progressData.progress > 0) {
        videoElement.currentTime = (progressData.progress / 100) * videoElement.duration;
      }
      
      if (progressData.completed) {
        setVideoCompleted(true);
      }
    }
  }, [progressData, videoRef]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    const videoElement = videoRef.current;
    const progress = Math.floor((videoElement.currentTime / videoElement.duration) * 100);
    setWatchProgress(progress);
    
    if (user?.id && videoId && progress % 5 === 0) {
      updateProgressMutation.mutate({
        userId: user.id,
        videoId,
        progress,
        completed: false
      });
    }
  };

  const handleVideoEnd = async () => {
    if (!user?.id || !videoId) return;
    
    try {
      setVideoCompleted(true);
      setShowFeedback(true);
      
      updateProgressMutation.mutate({
        userId: user.id,
        videoId,
        progress: 100,
        completed: true
      });
      
      toast.success("Video completed!");
    } catch (error: any) {
      console.error("Error marking video as watched:", error.message);
      toast.error("Failed to update video progress");
    }
  };

  const handlePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    if (videoElement.paused) {
      videoElement.play();
      setIsPlaying(true);
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  };

  const handleFeedback = async (isPositive: boolean) => {
    try {
      toast.success("Thanks for your feedback!");
      
      if (nextVideoId) {
        navigate(`/training/video/${moduleId}/${nextVideoId}`);
        return;
      }
      
      setTimeout(() => {
        navigate(`/training?module=${moduleId}`);
      }, 1500);
    } catch (error: any) {
      console.error("Error submitting feedback:", error.message);
      toast.error("Failed to submit feedback");
    }
  };

  const getNextVideo = () => {
    if (!videoId || !moduleVideos || moduleVideos.length === 0) return null;
    
    const currentIndex = moduleVideos.findIndex(v => v.id === videoId);
    if (currentIndex === -1 || currentIndex === moduleVideos.length - 1) return null;
    
    return moduleVideos[currentIndex + 1];
  };

  const nextVideo = getNextVideo();

  if (isLoadingVideo) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!video) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Video not found</h2>
          <p className="text-muted-foreground mt-2">The requested video could not be found.</p>
          <Button onClick={() => navigate("/training")} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Training
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{video.title}</h1>
            <p className="text-muted-foreground mt-2">
              {module?.title || (moduleId === "product" 
                ? "Product Knowledge" 
                : moduleId === "sales" 
                  ? "Sales Techniques" 
                  : "Retailer Relationships")} Module
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(`/training?module=${moduleId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Module
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="aspect-video bg-black relative">
            {video.url ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                  controlsList="nodownload"
                  onEnded={handleVideoEnd}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  src={video.url}
                />
                {!isPlaying && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 cursor-pointer"
                    onClick={handlePlayPause}
                  >
                    <PlayCircle className="h-20 w-20 text-white opacity-80" />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <p className="text-muted-foreground">
                  Video preview not available. This is a placeholder in the demo.
                </p>
              </div>
            )}
            
            {videoCompleted && (
              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                <CheckCircle className="h-5 w-5" />
              </div>
            )}
          </div>
          
          <CardHeader>
            <CardTitle>{video.title}</CardTitle>
            <CardDescription>{video.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Module</h3>
                <p className="text-sm text-muted-foreground">
                  {module?.title || (moduleId === "product" 
                    ? "Product Knowledge" 
                    : moduleId === "sales" 
                      ? "Sales Techniques" 
                      : "Retailer Relationships")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Duration</h3>
                <p className="text-sm text-muted-foreground">{video.duration}</p>
              </div>
            </div>
            
            {showFeedback && (
              <div className="mt-6 p-4 border rounded-lg">
                <h3 className="font-medium text-center mb-3">Was this video helpful?</h3>
                <div className="flex justify-center gap-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center" 
                    onClick={() => handleFeedback(true)}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Yes, it was helpful
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center" 
                    onClick={() => handleFeedback(false)}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    No, need improvement
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={() => navigate(`/training?module=${moduleId}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Module
            </Button>
            
            {videoCompleted && nextVideo && (
              <Button onClick={() => navigate(`/training/video/${moduleId}/${nextVideo.id}`)}>
                Watch Next Video
              </Button>
            )}
            
            {videoCompleted && !nextVideo && module?.quiz_id && (
              <Button onClick={() => navigate(`/training/quiz/${moduleId}`)}>
                Take Quiz
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default VideoPlayer;
