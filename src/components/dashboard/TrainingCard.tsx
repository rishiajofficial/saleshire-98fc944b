
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Lock, PlayCircle, BookOpen } from "lucide-react";
import { TrainingModuleProgress } from "@/types/training";

interface TrainingCardProps {
  canAccessTraining: boolean;
  trainingModules: TrainingModuleProgress[];
  isLoadingTraining: boolean;
}

export const TrainingCard = ({ canAccessTraining, trainingModules, isLoadingTraining }: TrainingCardProps) => {
  const navigate = useNavigate();

  const getModuleStatusBadge = (module: TrainingModuleProgress) => {
    switch (module.status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <PlayCircle className="mr-1 h-3 w-3" /> In Progress
          </Badge>
        );
      case "locked":
        return (
          <Badge variant="secondary">
            <Lock className="mr-1 h-3 w-3" /> Locked
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Progress</CardTitle>
        <CardDescription>
          {canAccessTraining 
            ? "Complete these modules to advance in the hiring process."
            : "Training modules will be available after HR reviews and approves your application."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canAccessTraining ? (
          <Alert>
            <AlertTitle>Training Locked</AlertTitle>
            <AlertDescription>
              The training section will be unlocked after HR reviews and approves your application.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {trainingModules.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No training modules available for your job application.</p>
            ) : (
              trainingModules.map((module) => (
                <Link 
                  to={`/training/module/${module.id}`}
                  key={module.id} 
                  className={`block p-4 border rounded-lg hover:bg-muted/50 transition-all ${module.locked ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{module.title}</span>
                    {getModuleStatusBadge(module)}
                  </div>
                  
                  <div className="mb-2">
                    <Progress value={module.progress} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                      {module.watchedVideos} of {module.totalVideos} videos completed
                    </span>
                    {module.quizCompleted ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Quiz passed
                      </span>
                    ) : module.quizIds && module.quizIds.length > 0 && module.watchedVideos === module.totalVideos ? (
                      <span className="text-blue-600 flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" /> Quiz available
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => navigate('/training')} 
          disabled={!canAccessTraining || isLoadingTraining}
        >
          Go to Training Center <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
