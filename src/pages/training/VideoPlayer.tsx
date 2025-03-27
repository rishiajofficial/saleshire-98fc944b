
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Play, Pause, Volume2, VolumeX } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

const VideoPlayer = () => {
  const navigate = useNavigate();
  const { moduleId, videoId } = useParams<{ moduleId: string; videoId: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [videoData, setVideoData] = useState<{
    title: string;
    duration: string;
    description: string;
  } | null>(null);

  // Simulate video progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 0.5;
          if (newProgress >= 100) {
            setIsPlaying(false);
            setVideoCompleted(true);
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 200);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, progress]);

  // Get video data based on moduleId and videoId
  useEffect(() => {
    // This would be an API call in a real application
    const getVideoDetails = () => {
      switch (moduleId) {
        case "product":
          switch (videoId) {
            case "1":
              return {
                title: "Introduction to Security Products",
                duration: "12:30",
                description: "This video introduces our range of security products, their core features, and how they solve customer problems.",
              };
            case "2":
              return {
                title: "Smart Lock Features & Benefits",
                duration: "15:45",
                description: "Learn about the key features and benefits of our smart lock product line and how to effectively communicate them to customers.",
              };
            case "3":
              return {
                title: "Understanding Target Customers",
                duration: "10:20",
                description: "This video provides insights into our target customer segments, their needs, and how our products address those needs.",
              };
            case "4":
              return {
                title: "Product Comparison & Positioning",
                duration: "14:15",
                description: "Learn how our products compare to competitors and how to position them effectively in the market.",
              };
            default:
              return null;
          }
        case "sales":
          switch (videoId) {
            case "1":
              return {
                title: "Effective Sales Pitching",
                duration: "18:45",
                description: "Learn the fundamentals of crafting and delivering an effective sales pitch that resonates with potential customers.",
              };
            case "2":
              return {
                title: "Handling Customer Objections",
                duration: "20:10",
                description: "This video teaches techniques for addressing common customer objections and turning them into opportunities.",
              };
            case "3":
              return {
                title: "Closing Techniques",
                duration: "16:30",
                description: "Learn proven closing techniques that help secure sales without being pushy or aggressive.",
              };
            case "4":
              return {
                title: "Follow-up Strategies",
                duration: "12:15",
                description: "Discover effective follow-up strategies to maintain relationships and secure future sales opportunities.",
              };
            default:
              return null;
          }
        default:
          return null;
      }
    };

    setVideoData(getVideoDetails());
  }, [moduleId, videoId]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleBackToTraining = () => {
    navigate('/training');
  };

  if (!videoData) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <p>Video not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="outline"
          className="mb-4"
          onClick={handleBackToTraining}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Training
        </Button>
        
        <Card className="mb-6">
          <div className="relative bg-black aspect-video rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-xl">Video Placeholder</div>
              {videoCompleted && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
              <div className="flex flex-col gap-2">
                <Progress value={progress} className="h-1" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-white"
                      onClick={togglePlay}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <div className="text-xs text-white">
                      {Math.floor(progress / 100 * parseInt(videoData.duration)) || 0}:
                      {Math.floor(((progress / 100 * parseInt(videoData.duration)) % 1) * 60)
                        .toString()
                        .padStart(2, '0')} / {videoData.duration}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-white"
                      onClick={toggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <CardHeader>
            <CardTitle>{videoData.title}</CardTitle>
            <CardDescription>{videoData.duration} • Training Material</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {videoData.description}
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4 flex justify-between">
            {videoCompleted ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                Video completed
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {isPlaying ? "Playing..." : "Paused"}
              </div>
            )}
            
            <Button 
              onClick={handleBackToTraining}
              variant="outline"
            >
              Back to Training
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default VideoPlayer;
