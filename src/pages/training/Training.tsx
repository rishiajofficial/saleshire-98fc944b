
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
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState({
    product: 0,
    sales: 0,
    relationship: 0,
    overall: 0
  });

  useEffect(() => {
    if (user) {
      fetchTrainingData();
    }
  }, [user]);

  const fetchTrainingData = async () => {
    try {
      setIsLoading(true);
      
      // Get training modules
      const { data: moduleData, error: moduleError } = await supabase
        .from('training_modules')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (moduleError) throw moduleError;
      
      // Get videos
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (videoError) throw videoError;
      
      // Get watched videos (this would be from another table in a real app)
      // For now, we'll simulate some watched videos
      
      // Group videos by module
      const moduleMap: Record<string, Video[]> = {};
      videoData.forEach((video: Video) => {
        if (!moduleMap[video.module]) {
          moduleMap[video.module] = [];
        }
        
        // Simulate some videos as watched
        if (video.module === 'product' && Math.random() > 0.3) {
          video.watched = true;
        } else if (video.module === 'sales' && Math.random() > 0.7) {
          video.watched = true;
        } else {
          video.watched = false;
        }
        
        moduleMap[video.module].push(video);
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
      
      // Format modules with videos
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
          locked: productProgress < 80,
          videos: moduleMap['sales'] || []
        },
        {
          id: "retailer",
          title: "Retailer Relationships",
          description: "Strategies for building and maintaining relationships with retailers",
          module: "relationship",
          progress: relationshipProgress,
          status: relationshipProgress === 100 ? 'completed' : (salesProgress >= 80 ? 'in_progress' : 'locked'),
          locked: salesProgress < 80,
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
      toast.error("Failed to load training data");
      console.error("Error fetching training data:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleWatchVideo = (moduleId: string, videoId: string) => {
    // In a real application, this would track video progress
    // For now, we'll just navigate to a video player page
    navigate(`/training/video/${moduleId}/${videoId}`);
  };

  const handleTakeQuiz = (moduleId: string) => {
    navigate(`/training/quiz/${moduleId}`);
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
                    {module.videos.map((video) => (
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
                    ))}
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
