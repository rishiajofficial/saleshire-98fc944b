
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import ReactPlayer from 'react-player';
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface VideoDetails {
  id: string;
  title: string;
  description: string | null;
  url: string;
  module: string;
  duration: string;
}

interface TrainingProgress {
  id?: string;
  user_id: string;
  video_id: string;
  module: string;
  completed: boolean;
  completed_at?: string | null;
}

const VideoPlayer = () => {
  const { videoId, moduleId } = useParams<{ videoId: string, moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [alreadyMarkedComplete, setAlreadyMarkedComplete] = useState(false);

  // Create the training_progress table first if it doesn't exist
  useEffect(() => {
    const checkTableExists = async () => {
      if (!user) return;
      try {
        // Simple query to check if we can access the training_progress data
        // If table doesn't exist, this will fail silently
        const { data } = await supabase
          .from('training_progress')
          .select('*')
          .limit(1);
        
        console.log("Training progress table check:", data);
      } catch (error) {
        console.error("Error checking training_progress table:", error);
      }
    };
    
    checkTableExists();
  }, [user]);

  // Fetch the video details
  const { data: videoDetails, isLoading, error } = useQuery({
    queryKey: ['videoDetails', videoId],
    queryFn: async (): Promise<VideoDetails | null> => {
      if (!videoId) return null;
      
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();
      
      if (error) {
        toast.error(`Error loading video: ${error.message}`);
        throw error;
      }
      
      return data;
    }
  });

  // Check if this video was already completed
  const { data: progressData } = useQuery({
    queryKey: ['videoProgress', videoId, user?.id],
    queryFn: async () => {
      if (!user || !videoId) return null;
      
      try {
        const { data, error } = await supabase
          .from('training_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('video_id', videoId)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error("Error fetching progress:", error);
        }
        
        if (data && data.completed) {
          setAlreadyMarkedComplete(true);
        }
        
        return data;
      } catch (error) {
        console.error("Error in videoProgress query:", error);
        return null;
      }
    },
    enabled: !!user && !!videoId
  });

  // Mutation to mark video as completed
  const markVideoCompletedMutation = useMutation({
    mutationFn: async () => {
      if (!user || !videoId || !moduleId) {
        throw new Error("Missing required data");
      }
      
      try {
        // Check if a record already exists
        const { data: existingRecord, error: fetchError } = await supabase
          .from('training_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('video_id', videoId)
          .single();
          
        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }
        
        if (existingRecord) {
          const { error } = await supabase
            .from('training_progress')
            .update({ 
              completed: true,
              completed_at: new Date().toISOString() 
            })
            .eq('id', existingRecord.id);
            
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('training_progress')
            .insert([{
              user_id: user.id,
              video_id: videoId,
              module: moduleId,
              completed: true,
              completed_at: new Date().toISOString()
            }]);
            
          if (error) throw error;
        }
        
        return { success: true };
      } catch (error) {
        console.error("Error in markVideoCompletedMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      setAlreadyMarkedComplete(true);
      toast.success("Video marked as completed!");
    },
    onError: (error: Error) => {
      toast.error(`Error updating progress: ${error.message}`);
    }
  });

  const handleProgress = (state: { played: number }) => {
    // Update video progress
    setVideoProgress(Math.floor(state.played * 100));
    
    // Mark video as completed when user watches more than 90%
    if (state.played > 0.9 && !videoCompleted && !alreadyMarkedComplete) {
      setVideoCompleted(true);
      markVideoCompletedMutation.mutate();
    }
  };

  const handleVideoReady = () => {
    setVideoLoaded(true);
  };

  const navigateToModule = () => {
    // Check if we have videoDetails with module information
    if (videoDetails?.module) {
      // First check if moduleId from params exists and use that
      if (moduleId) {
        navigate(`/training/module/${moduleId}`);
        return;
      }
      
      // If no moduleId in params, just go to training with the module name as identifier
      navigate(`/training/module/${videoDetails.module}`);
    } else {
      // If we don't have video details, just go back to the training page
      navigate('/training');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error || !videoDetails) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Error Loading Video</h2>
          <p className="text-gray-500 mb-4">
            {error ? error.message : "Video not found"}
          </p>
          <Button onClick={navigateToModule}>
            Return to Module
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <TooltipProvider>
      <MainLayout>
        <div className="container mx-auto py-8">
          <Button
            variant="outline"
            className="mb-6"
            onClick={navigateToModule}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Module
          </Button>
          
          <h1 className="text-2xl font-bold mb-4">{videoDetails.title}</h1>
          
          {videoDetails.description && (
            <p className="text-gray-600 mb-6">{videoDetails.description}</p>
          )}
          
          <Card className="mb-6">
            <CardContent className="p-0 relative aspect-video">
              {!videoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
              <ReactPlayer
                url={videoDetails.url}
                controls
                width="100%"
                height="100%"
                onProgress={handleProgress}
                onReady={handleVideoReady}
                className="aspect-video"
                config={{
                  youtube: {
                    playerVars: { autoplay: 1 }
                  },
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                      disablePictureInPicture: true
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Progress: {videoProgress}%
                {alreadyMarkedComplete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-2 text-green-500">
                        Completed
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>You've watched this video and marked it as completed</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </p>
              <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${videoProgress}%` }}
                ></div>
              </div>
            </div>
            <Button onClick={navigateToModule}>
              Return to Module
            </Button>
          </div>
        </div>
      </MainLayout>
    </TooltipProvider>
  );
};

export default VideoPlayer;
