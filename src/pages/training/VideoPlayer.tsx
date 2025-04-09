
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const VideoPlayer = () => {
  const { moduleId, videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Fetch video details
  const { data: video, isLoading } = useQuery({
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

  // Mark video as complete after watching
  const handleVideoEnd = async () => {
    if (!user || !videoId) return;
    
    try {
      // In a real application, this would update a database table
      // to track which videos a user has watched
      setVideoCompleted(true);
      setShowFeedback(true);
      
      // Simulate API call
      toast.success("Video marked as watched");
    } catch (error: any) {
      console.error("Error marking video as watched:", error.message);
      toast.error("Failed to update video progress");
    }
  };

  const handleFeedback = async (isPositive: boolean) => {
    try {
      // In a real application, this would send feedback to a database
      toast.success("Thanks for your feedback!");
      
      // Navigate back to training page
      setTimeout(() => {
        navigate(`/training`);
      }, 1500);
    } catch (error: any) {
      console.error("Error submitting feedback:", error.message);
      toast.error("Failed to submit feedback");
    }
  };

  if (isLoading) {
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
              {moduleId === "product" 
                ? "Product Knowledge" 
                : moduleId === "sales" 
                  ? "Sales Techniques" 
                  : "Retailer Relationships"} Module
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/training")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Training
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="aspect-video bg-black relative">
            {video.url ? (
              <video
                className="w-full h-full"
                controls
                autoPlay
                controlsList="nodownload"
                onEnded={handleVideoEnd}
                src={video.url}
              />
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
                  {moduleId === "product" 
                    ? "Product Knowledge" 
                    : moduleId === "sales" 
                      ? "Sales Techniques" 
                      : "Retailer Relationships"}
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
            <Button variant="outline" onClick={() => navigate("/training")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Training
            </Button>
            
            {videoCompleted && (
              <Button onClick={() => navigate("/training")}>
                Continue Training
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default VideoPlayer;
