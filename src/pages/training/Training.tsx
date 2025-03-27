
import React, { useState } from "react";
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
  BookOpen,
  ArrowRight,
  CheckCircle2,
  FileText,
  Lock,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Training = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("product");

  // Mock data for training modules
  const trainingModules = [
    {
      id: "product",
      title: "Product Knowledge",
      description: "Learn about our security products, features, and target customers",
      progress: 80,
      status: "in_progress",
      locked: false,
      videos: [
        {
          id: 1,
          title: "Introduction to Security Products",
          duration: "12:30",
          watched: true,
          thumbnail: "/placeholder.svg",
        },
        {
          id: 2,
          title: "Smart Lock Features & Benefits",
          duration: "15:45",
          watched: true,
          thumbnail: "/placeholder.svg",
        },
        {
          id: 3,
          title: "Understanding Target Customers",
          duration: "10:20",
          watched: false,
          thumbnail: "/placeholder.svg",
        },
        {
          id: 4,
          title: "Product Comparison & Positioning",
          duration: "14:15",
          watched: false,
          thumbnail: "/placeholder.svg",
        },
      ],
    },
    {
      id: "sales",
      title: "Sales Techniques",
      description: "Master effective pitching, objection handling, and closing techniques",
      progress: 30,
      status: "in_progress",
      locked: false,
      videos: [
        {
          id: 1,
          title: "Effective Sales Pitching",
          duration: "18:45",
          watched: true,
          thumbnail: "/placeholder.svg",
        },
        {
          id: 2,
          title: "Handling Customer Objections",
          duration: "20:10",
          watched: false,
          thumbnail: "/placeholder.svg",
        },
        {
          id: 3,
          title: "Closing Techniques",
          duration: "16:30",
          watched: false,
          thumbnail: "/placeholder.svg",
        },
        {
          id: 4,
          title: "Follow-up Strategies",
          duration: "12:15",
          watched: false,
          thumbnail: "/placeholder.svg",
        },
      ],
    },
    {
      id: "retailer",
      title: "Retailer Relationships",
      description: "Strategies for building and maintaining relationships with retailers",
      progress: 0,
      status: "locked",
      locked: true,
      videos: [
        {
          id: 1,
          title: "Understanding Retailer Needs",
          duration: "14:20",
          watched: false,
          thumbnail: "/placeholder.svg",
        },
        {
          id: 2,
          title: "Building Long-term Partnerships",
          duration: "16:35",
          watched: false,
          thumbnail: "/placeholder.svg",
        },
        {
          id: 3,
          title: "Retailer Support Strategies",
          duration: "13:45",
          watched: false,
          thumbnail: "/placeholder.svg",
        },
        {
          id: 4,
          title: "Conflict Resolution",
          duration: "15:30",
          watched: false,
          thumbnail: "/placeholder.svg",
        },
      ],
    },
  ];

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

  const handleWatchVideo = (moduleId: string, videoId: number) => {
    // In a real application, this would track video progress
    // For now, we'll just navigate to a video player page
    navigate(`/training/video/${moduleId}/${videoId}`);
  };

  const handleTakeQuiz = (moduleId: string) => {
    navigate(`/training/quiz/${moduleId}`);
  };

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
                  <span className="text-sm font-medium">80%</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Sales Techniques</span>
                  <span className="text-sm font-medium">30%</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Retailer Relationships</span>
                  <span className="text-sm font-medium">0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-medium">37%</span>
                </div>
                <Progress value={37} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeModule} onValueChange={setActiveModule}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="product">Product Knowledge</TabsTrigger>
            <TabsTrigger value="sales">Sales Techniques</TabsTrigger>
            <TabsTrigger value="retailer" disabled={trainingModules[2].locked}>
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
                              src={video.thumbnail} 
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
                    <FileText className="mr-2 h-4 w-4" />
                    Take Quiz
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
