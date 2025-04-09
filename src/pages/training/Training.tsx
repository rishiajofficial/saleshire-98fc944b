
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PlayCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

// Types for training data
interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  module: string;
  watched?: boolean;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  module: string;
  progress: number;
  status: 'completed' | 'in_progress' | 'locked';
  locked: boolean;
  videos: Video[];
}

const Training = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeModule, setActiveModule] = useState("product");
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [progress, setProgress] = useState({
    product: 0,
    sales: 0,
    relationship: 0,
    overall: 0
  });

  // Fetch candidate data to check current step
  const { data: candidateData, isLoading: candidateLoading } = useQuery({
    queryKey: ['candidate-data', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch training modules
  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ['training-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data;
    }
  });

  // Fetch videos
  const { data: videosData, isLoading: videosLoading } = useQuery({
    queryKey: ['training-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data;
    }
  });

  // Fetch user's watched videos - this would connect to a real table in a complete implementation
  const { data: watchedVideosData, isLoading: watchedLoading } = useQuery({
    queryKey: ['watched-videos', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      // This is a placeholder - in a real implementation, you would have a table to track
      // which videos a user has watched. For now, we'll simulate this data.
      return [
        { video_id: "1", user_id: user.id, completed: true },
        { video_id: "3", user_id: user.id, completed: true }
      ];
    },
    enabled: !!user
  });

  // Process the data when it's loaded
  useEffect(() => {
    if (!modulesLoading && !videosLoading && !watchedLoading && modulesData && videosData) {
      try {
        // Organize videos by module
        const moduleMap: Record<string, Video[]> = {};
        videosData.forEach((video: any) => {
          if (!moduleMap[video.module]) {
            moduleMap[video.module] = [];
          }
          
          // Check if video is watched (in a real app, this would be from the watchedVideosData)
          const isWatched = watchedVideosData?.some(
            (watched: any) => watched.video_id === video.id && watched.completed
          );
          
          moduleMap[video.module].push({
            ...video,
            watched: isWatched || false
          });
        });
        
        // Calculate progress for each module
        const productProgress = calculateModuleProgress(moduleMap['product'] || []);
        const salesProgress = calculateModuleProgress(moduleMap['sales'] || []);
        const relationshipProgress = calculateModuleProgress(moduleMap['relationship'] || []);
        
        // Overall progress
        const overallProgress = Math.round(
          (productProgress + salesProgress + relationshipProgress) / 3
        );
        
        setProgress({
          product: productProgress,
          sales: salesProgress,
          relationship: relationshipProgress,
          overall: overallProgress
        });
        
        // Format modules with videos and determine access based on candidate step
        const currentStep = candidateData?.current_step || 1;
        
        const formattedModules: TrainingModule[] = [
          {
            id: "product",
            title: "Product Knowledge",
            description: "Learn about our security products, features, and target customers",
            module: "product",
            progress: productProgress,
            status: productProgress === 100 ? 'completed' : 'in_progress',
            locked: false,
            videos: moduleMap['product'] || []
          },
          {
            id: "sales",
            title: "Sales Techniques",
            description: "Master effective pitching, objection handling, and closing techniques",
            module: "sales",
            progress: salesProgress,
            status: salesProgress === 100 ? 'completed' : (productProgress >= 80 ? 'in_progress' : 'locked'),
            locked: productProgress < 80 || currentStep < 3,
            videos: moduleMap['sales'] || []
          },
          {
            id: "retailer",
            title: "Retailer Relationships",
            description: "Strategies for building and maintaining relationships with retailers",
            module: "relationship",
            progress: relationshipProgress,
            status: relationshipProgress === 100 ? 'completed' : (salesProgress >= 80 ? 'in_progress' : 'locked'),
            locked: salesProgress < 80 || currentStep < 3,
            videos: moduleMap['relationship'] || []
          }
        ];
        
        setTrainingModules(formattedModules);
        
        // Set active module to the one in progress
        if (productProgress < 100) {
          setActiveModule("product");
        } else if (salesProgress < 100 && productProgress >= 80) {
          setActiveModule("sales");
        } else if (relationshipProgress < 100 && salesProgress >= 80) {
          setActiveModule("retailer");
        }
      } catch (error: any) {
        console.error("Error processing training data:", error.message);
        toast.error("Failed to process training data");
      }
    }
  }, [modulesData, videosData, watchedVideosData, candidateData]);

  const calculateModuleProgress = (videos: Video[]) => {
    if (videos.length === 0) return 0;
    
    const watchedVideos = videos.filter(video => video.watched).length;
    return Math.round((watchedVideos / videos.length) * 100);
  };

  const getModuleStatus = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Progress
          </Badge>
        );
      case "locked":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Lock className="mr-1 h-3 w-3" /> Locked
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleWatchVideo = async (moduleId: string, videoId: string) => {
    if (!user) return;
    
    try {
      // In a real application, this would log the video as watched in the database
      // For now, we'll navigate to the video player
      navigate(`/training/video/${moduleId}/${videoId}`);
      
      // Simulate marking a video as watched
      toast.success("Video marked as watched");
      
      // We would refresh the data after marking the video as watched
      // In a real implementation, you'd refetch the watchedVideos data
    } catch (error: any) {
      console.error("Error tracking video watch:", error.message);
      toast.error("Failed to track video progress");
    }
  };

  const handleTakeQuiz = (moduleId: string) => {
    navigate(`/training/quiz/${moduleId}`);
  };

  const isLoading = modulesLoading || videosLoading || watchedLoading || candidateLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Center</h1>
          <p className="text-muted-foreground mt-2">
            Complete all modules and pass the quizzes to move to the next step
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Training Progress</CardTitle>
            <CardDescription>
              Overall completion across all required modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Product Knowledge</span>
                  <span className="text-sm font-medium">{progress.product}%</span>
                </div>
                <Progress value={progress.product} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Sales Techniques</span>
                  <span className="text-sm font-medium">{progress.sales}%</span>
                </div>
                <Progress value={progress.sales} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Retailer Relationships</span>
                  <span className="text-sm font-medium">{progress.relationship}%</span>
                </div>
                <Progress value={progress.relationship} className="h-2" />
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-medium">{progress.overall}%</span>
                </div>
                <Progress value={progress.overall} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeModule} onValueChange={setActiveModule}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="product">Product Knowledge</TabsTrigger>
            <TabsTrigger value="sales" disabled={trainingModules[1]?.locked}>
              Sales Techniques
            </TabsTrigger>
            <TabsTrigger value="retailer" disabled={trainingModules[2]?.locked}>
              Retailer Relationships
            </TabsTrigger>
          </TabsList>

          {trainingModules.map((module) => (
            <TabsContent key={module.id} value={module.id} className="pt-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                    <div>{getModuleStatus(module.status)}</div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Module Progress</span>
                      <span className="text-sm font-medium">{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-2" />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-medium mb-4">Training Videos</h3>
                  <div className="grid gap-4">
                    {module.videos.length > 0 ? (
                      module.videos.map((video) => (
                        <div 
                          key={video.id} 
                          className={`p-4 border rounded-lg ${module.locked ? 'opacity-60' : ''}`}
                        >
                          <div className="flex gap-4">
                            <div className="w-32 h-20 rounded-md bg-muted overflow-hidden flex-shrink-0">
                              <img 
                                src="/placeholder.svg" 
                                alt={video.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{video.title}</h4>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <span className="mr-3">{video.duration}</span>
                                {video.watched && (
                                  <span className="flex items-center text-green-600">
                                    <CheckCircle2 className="mr-1 h-3 w-3" /> Watched
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col justify-center">
                              <Button 
                                onClick={() => handleWatchVideo(module.id, video.id)}
                                variant="outline" 
                                size="sm"
                                className="flex items-center"
                                disabled={module.locked}
                              >
                                <PlayCircle className="mr-1 h-4 w-4" />
                                {video.watched ? "Rewatch" : "Watch"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No videos available for this module
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6 pb-4 flex justify-between">
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/candidate">
                      Back to Dashboard
                    </Link>
                  </Button>
                  <Button 
                    onClick={() => handleTakeQuiz(module.id)}
                    disabled={module.progress < 80 || module.locked}
                  >
                    {module.progress >= 80 ? "Take Quiz" : `Complete ${80 - module.progress}% more to unlock quiz`}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Training;
