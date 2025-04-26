
import React from 'react';
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ModuleQuizProps {
  moduleId: string;
  quizIds: string[] | null;
  allVideosWatched: boolean;
  quizCompleted: boolean;
}

const ModuleQuiz = ({ moduleId, quizIds, allVideosWatched, quizCompleted }: ModuleQuizProps) => {
  if (!quizIds || quizIds.length === 0) return null;

  return (
    <Card className={`${!allVideosWatched ? "opacity-75" : ""} ${quizCompleted ? "border-green-200" : ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          Module Assessment
          {quizCompleted && (
            <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
          )}
        </CardTitle>
        <CardDescription>
          {quizCompleted 
            ? "You've successfully completed this assessment!"
            : (allVideosWatched 
              ? "You've completed all videos! Take the assessment to test your knowledge."
              : "Complete all videos above to unlock this assessment")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!allVideosWatched ? (
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Complete All Videos First</span>
          </div>
        ) : (
          <Button 
            asChild
            variant={quizCompleted ? "outline" : "default"}
          >
            <Link to={`/training/quiz/${moduleId}`}>
              {quizCompleted ? "Retake Assessment" : "Start Assessment"}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ModuleQuiz;
