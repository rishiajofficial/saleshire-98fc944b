
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, RefreshCw } from "lucide-react";

interface QuizQuestionProps {
  currentQuestion: {
    text: string;
    options: string[];
  };
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  selectedAnswer: string | null;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  answeredCount: number;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  timeRemaining,
  selectedAnswer,
  onAnswerChange,
  onSubmit,
  isSubmitting,
  answeredCount,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Question {currentQuestionIndex + 1} of {totalQuestions}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>
        <div className="flex justify-end mt-2">
          <Badge variant={timeRemaining < 10 ? "destructive" : "outline"}>
            <Clock className="mr-1 h-4 w-4" />
            {timeRemaining}s
          </Badge>
        </div>
        <Progress 
          value={(currentQuestionIndex + 1) / totalQuestions * 100} 
          className="h-2 mt-2" 
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-lg font-medium">
            {currentQuestion.text}
          </div>
          
          <RadioGroup 
            value={selectedAnswer || ""}
            onValueChange={onAnswerChange}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option} 
                  id={`option-${index}`} 
                />
                <Label htmlFor={`option-${index}`} className="font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={onSubmit}
          disabled={!selectedAnswer || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : "Submit Answer"}
        </Button>
      </CardFooter>
    </Card>
  );
};
