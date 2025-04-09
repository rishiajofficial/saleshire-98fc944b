import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PlayCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TrainingModuleListProps {
  currentStep: number;
}

const TrainingModuleList: React.FC<TrainingModuleListProps> = ({ currentStep }) => {
  const { user } = useAuth();

  // Fetch training modules data
  const { data: modules, isLoading } = useQuery({
    queryKey: ['training-modules-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data;
    }
  });

  // Fetch videos to calculate progress
  const { data: videos } = useQuery({
    queryKey: ['training-videos-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*');
        
      if (error) throw error;
      return data;
    }
  });

  // In a real app, you would fetch the user's progress from a database
  // For now, we'll calculate mock progress based on the current step
  const getModuleProgress = (moduleId: string) => {
    if (!moduleId) return 0;
    
    // Simple logic based on current step:
    // - If current_step is 3 or higher, first module is 100%
    // - If current_step is 4 or higher, second module is 100%
    // - If current_step is 5, third module is 100%
    // Otherwise, calculate partial progress
    
    if (moduleId === "product") {
      return currentStep >= 3 ? 100 : (currentStep >= 2 ? 60 : 0);
    } else if (moduleId === "sales") {
      return currentStep >= 4 ? 100 : (currentStep >= 3 ? 70 : 0);
    } else if (moduleId === "retailer") {
      return currentStep >= 5 ? 100 : (currentStep >= 4 ? 50 : 0);
    }
    
    return 0;
  };

  const getModuleStatus = (moduleId: string) => {
    const progress = getModuleProgress(moduleId);
    
    if (progress === 100) {
      return "completed";
    } else if (progress > 0) {
      return "in_progress";
    } else {
      // Check if this module should be locked based on previous modules
      if (moduleId === "sales" && getModuleProgress("product") < 80) {
        return "locked";
      } else if (moduleId === "retailer" && getModuleProgress("sales") < 80) {
        return "locked";
      }
      
      return "locked";
    }
  };

  // Generate training module data
  const trainingModules = [
    {
      id: "product",
      title: "Product Knowledge",
      description: "Learn about our security products, features, and target customers",
      progress: getModuleProgress("product"),
      status: getModuleStatus("product"),
      quizScore: getModuleProgress("product") >= 80 ? "85%" : null,
      path: "/training?module=product"
    },
    {
      id: "sales",
      title: "Sales Techniques",
      description: "Master effective pitching, objection handling, and closing techniques",
      progress: getModuleProgress("sales"),
      status: getModuleStatus("sales"),
      quizScore: getModuleProgress("sales") >= 80 ? "78%" : null,
      path: "/training?module=sales"
    },
    {
      id: "retailer",
      title: "Retailer Relationships",
      description: "Strategies for building and maintaining relationships with retailers",
      progress: getModuleProgress("retailer"),
      status: getModuleStatus("retailer"),
      quizScore: getModuleProgress("retailer") >= 80 ? "92%" : null,
      path: "/training"
    },
  ];

  const getModuleStatusBadge = (status: string) => {
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
            Locked
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Training Modules</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Modules</CardTitle>
        <CardDescription>
          Complete all modules and quizzes to progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {trainingModules.map((module) => (
            <div key={module.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-lg">{module.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>
                </div>
                <div>{getModuleStatusBadge(module.status)}</div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{module.progress}%</span>
                </div>
                <Progress value={module.progress} className="h-2" />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  {module.quizScore && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Quiz Score: {module.quizScore}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {module.status !== "locked" && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9"
                        asChild
                      >
                        <Link to={module.path}>
                          <PlayCircle className="mr-1 h-4 w-4" />
                          {module.status === "completed" ? "Review" : "Continue"}
                        </Link>
                      </Button>
                      {module.status === "in_progress" && (
                        <Button 
                          size="sm" 
                          className="h-9"
                          asChild
                        >
                          <Link to={`/training/quiz/${module.id === 'product' ? 'product' : module.id === 'sales' ? 'sales' : 'retailer'}`}>
                            <FileText className="mr-1 h-4 w-4" />
                            Take Quiz
                          </Link>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingModuleList;
