
import React, { useState } from "react";
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
  Lock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TrainingModuleListProps {
  currentStep: number;
}

const TrainingModuleList: React.FC<TrainingModuleListProps> = ({ currentStep }) => {
  const { user } = useAuth();
  const [moduleBeingStarted, setModuleBeingStarted] = useState<string | null>(null);

  // Fetch training modules data
  const { data: modules, isLoading: isLoadingModules } = useQuery({
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

  // Fetch candidate progress data
  const { data: progressData, isLoading: isLoadingProgress, refetch: refetchProgress } = useQuery({
    queryKey: ['candidate-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('candidate_id', user.id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const handleStartModule = async (moduleId: string) => {
    try {
      setModuleBeingStarted(moduleId);
      
      // Mark this module as started in the database
      // In a real app, we would update a user_progress table
      
      // For demo purposes, we'll just show a toast and navigate
      toast.success("Module started! You can now watch the videos and take the quiz.");
      
      // Navigate to the training page for this module
      // This will happen through the Link component's onClick
    } catch (error) {
      console.error("Error starting module:", error);
      toast.error("Failed to start module. Please try again.");
    } finally {
      setModuleBeingStarted(null);
    }
  };

  // Calculate progress based on real data
  const getModuleProgress = (moduleId: string) => {
    if (!moduleId || !progressData) return 0;
    
    // In a real app, we would calculate this based on the number of videos watched
    // and quizzes completed for this specific module
    
    // For now, we'll use simplified logic based on assessment results and current step
    const moduleAssessments = progressData.filter((result: any) => 
      result.assessment_id === moduleId || 
      (modules?.find(m => m.id === moduleId)?.quiz_id === result.assessment_id)
    );
    
    if (moduleAssessments.length > 0) {
      // If there's a completed assessment for this module
      const completed = moduleAssessments.some((result: any) => result.completed);
      return completed ? 100 : 70;
    }
    
    // Fall back to step-based logic for demo
    if (moduleId === modules?.[0]?.id) {
      return currentStep >= 3 ? 100 : (currentStep >= 2 ? 60 : 0);
    } else if (moduleId === modules?.[1]?.id) {
      return currentStep >= 4 ? 100 : (currentStep >= 3 ? 70 : 0);
    } else if (moduleId === modules?.[2]?.id) {
      return currentStep >= 5 ? 100 : (currentStep >= 4 ? 50 : 0);
    }
    
    return 0;
  };

  const getModuleStatus = (moduleId: string, index: number) => {
    const progress = getModuleProgress(moduleId);
    
    if (progress === 100) {
      return "completed";
    } else if (progress > 0) {
      return "in_progress";
    } else {
      // Check if this module should be locked based on previous modules
      if (index > 0 && getModuleProgress(modules?.[index-1]?.id || "") < 80) {
        return "locked";
      }
      
      // Check if user has correct step to access this module
      if (index === 0 && currentStep < 2) {
        return "locked";
      } else if (index === 1 && currentStep < 3) {
        return "locked";
      } else if (index === 2 && currentStep < 4) {
        return "locked";
      }
      
      return "available";
    }
  };

  const getModuleQuizScore = (moduleId: string) => {
    if (!moduleId || !progressData) return null;
    
    const moduleQuizId = modules?.find(m => m.id === moduleId)?.quiz_id;
    
    if (moduleQuizId) {
      const quizResult = progressData.find((result: any) => 
        result.assessment_id === moduleQuizId && result.completed
      );
      
      if (quizResult?.score) {
        return `${Math.round(quizResult.score)}%`;
      }
    }
    
    // Fall back to mock data for demo
    const progress = getModuleProgress(moduleId);
    if (progress >= 80) {
      if (moduleId === modules?.[0]?.id) return "85%";
      if (moduleId === modules?.[1]?.id) return "78%";
      if (moduleId === modules?.[2]?.id) return "92%";
    }
    
    return null;
  };

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
      case "available":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Available
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

  if (isLoadingModules || isLoadingProgress) {
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

  // If no modules are found, show a message
  if (!modules || modules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Training Modules</CardTitle>
          <CardDescription>No training modules available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Training modules will be available soon. Check back later.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Map database modules to UI format
  const trainingModules = modules.map((module, index) => ({
    id: module.id,
    title: module.title || `Module ${index + 1}`,
    description: module.description || "Complete this module to progress in your training",
    progress: getModuleProgress(module.id),
    status: getModuleStatus(module.id, index),
    quizScore: getModuleQuizScore(module.id),
    path: `/training?module=${module.module || module.id}`
  }));

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
          {trainingModules.map((module, index) => (
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
                  {module.status !== "locked" ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9"
                        asChild
                        disabled={moduleBeingStarted === module.id}
                        onClick={() => module.status === "available" && handleStartModule(module.id)}
                      >
                        <Link to={module.path}>
                          <PlayCircle className="mr-1 h-4 w-4" />
                          {module.status === "completed" ? "Review" : 
                           module.status === "in_progress" ? "Continue" : "Start"}
                        </Link>
                      </Button>
                      {(module.status === "in_progress" || module.status === "completed") && (
                        <Button 
                          size="sm" 
                          className="h-9"
                          asChild
                        >
                          <Link to={`/training/quiz/${modules[index]?.module || modules[index]?.id}`}>
                            <FileText className="mr-1 h-4 w-4" />
                            {module.status === "completed" ? "Retake Quiz" : "Take Quiz"}
                          </Link>
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9"
                      disabled
                    >
                      <Lock className="mr-1 h-4 w-4" />
                      Locked
                    </Button>
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
