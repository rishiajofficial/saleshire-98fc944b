
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface ModuleHeaderProps {
  title: string | undefined;
  description: string | null | undefined;
  watchedCount: number;
  totalVideos: number;
  progress: number;
  quizCompleted: boolean;
}

const ModuleHeader = ({ 
  title, 
  description, 
  watchedCount, 
  totalVideos, 
  progress, 
  quizCompleted 
}: ModuleHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate('/training')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Training
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{title} Training Module</h1>
        <p className="text-muted-foreground mt-2">
          Complete all videos to unlock the assessment
        </p>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Progress: {watchedCount} of {totalVideos} videos watched
              ({progress}%)
            </span>
            {quizCompleted && (
              <span className="text-sm font-medium text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" /> Quiz Completed
              </span>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </>
  );
};

export default ModuleHeader;
