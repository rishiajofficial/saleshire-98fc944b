
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

  // Fetch candidate progress data - assessment results
  const { data: quizResults, isLoading: isLoadingQuizResults } = useQuery({
    queryKey: ['candidate-quiz-results', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('candidate_id', user.id)
        .eq('completed', true);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch videos watched data
  const { data: videosWatched, isLoading: isLoadingVideosWatched } = useQuery({
    queryKey: ['videos-watched', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      // This would be a real endpoint to fetch which videos the user has watched
      // For now, we'll mock this by checking the quiz completion status
      return [];
    },
    enabled: !!user
  });

  const handleStartModule = async (moduleId: string) => {
    try {
      setModuleBeingStarted(moduleId);
      
      // In a real implementation, we would track that the user started this module
      // For now, just show a toast and navigate via the Link component
      toast.success("Module started! You can now watch the videos and take the quiz.");
    } catch (error) {
      console.error("Error starting module:", error);
      toast.error("Failed to start module. Please try again.");
    } finally {
      setModuleBeingStarted(null);
    }
  };

  // Calculate progress based on real quiz data
  const getModuleProgress = (moduleId: string) => {
    if (!moduleId || !modules || !quizResults) return 0;
    
    const module = modules.find(m => m.id === moduleId);
    if (!module) return 0;
    
    // Check if the quiz for this module has been completed
    const quizCompleted = quizResults.some(result => 
      result.assessment_id === module.quiz_id && result.completed
    );
    
    if (quizCompleted) {
      return 100;
    }
    
    // If not completed, calculate based on videos watched or accessibility
    // This would use the videosWatched data in a real implementation
    
    // For now, use step-based logic as a fallback
    if (moduleId === modules[0]?.id) {
      return currentStep >= 3 ? 50 : 0;
    } else if (moduleId === modules[1]?.id) {
      return currentStep >= 4 ? 50 : 0;
    } else if (moduleId === modules[2]?.id) {
      return currentStep >= 5 ? 50 : 0;
    }
    
    return 0;
  };

  const getModuleStatus = (moduleId: string, index: number) => {
    if (!modules) return "locked";
    
    const progress = getModuleProgress(moduleId);
    
    if (progress === 100) {
      return "completed";
    } else if (progress > 0) {
      return "in_progress";
    } 
    
    // Check if this module should be locked based on previous modules
    if (index > 0) {
      const prevModuleId = modules[index-1]?.id;
      const prevModuleProgress = getModuleProgress(prevModuleId);
      
      if (prevModuleProgress < 100) {
        return "locked";
      }
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
  };

  const getModuleQuizScore = (moduleId: string) => {
    if (!moduleId || !quizResults || !modules) return null;
    
    const module = modules.find(m => m.id === moduleId);
    if (!module || !module.quiz_id) return null;
    
    const quizResult = quizResults.find(result => 
      result.assessment_id === module.quiz_id && result.completed
    );
    
    if (quizResult?.score !== undefined) {
      return `${Math.round(Number(quizResult.score))}%`;
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

  if (isLoadingModules || isLoadingQuizResults || isLoadingVideosWatched) {
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
    path: `/training?module=${module.module || module.id}`,
    quizPath: `/training/quiz/${module.module || module.id}`
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
                          <Link to={module.quizPath}>
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
