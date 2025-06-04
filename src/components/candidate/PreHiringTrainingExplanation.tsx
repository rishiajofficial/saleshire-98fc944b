
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, PlayCircle, BookOpen } from "lucide-react";

export const PreHiringTrainingExplanation = () => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <GraduationCap className="h-5 w-5" />
          Welcome to the Pre-Hiring Training!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-blue-800 space-y-3">
          <p className="text-sm leading-relaxed">
            This short training is designed to give you a quick overview of the job role through brief videos. 
            It helps you understand the key concepts and decide if you're interested in this position.
          </p>
          
          <p className="text-sm leading-relaxed">
            You'll also take a short quiz to show how much you've grasped. This helps the manager see how 
            coachable you are in this area — even if you're not an expert yet.
          </p>
          
          <p className="text-sm leading-relaxed font-medium">
            Please watch the videos carefully and complete the quiz to move forward in your application journey.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <PlayCircle className="h-4 w-4" />
            <span>Watch training videos</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <BookOpen className="h-4 w-4" />
            <span>Complete assessment quiz</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
