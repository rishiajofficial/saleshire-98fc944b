
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface QuizStartProps {
  title: string;
  description: string;
  onStart: () => void;
}

export const QuizStart: React.FC<QuizStartProps> = ({ 
  title, 
  description, 
  onStart 
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 text-blue-700 p-4 rounded-md border border-blue-200">
          <h3 className="text-lg font-semibold mb-2">Quiz Instructions</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Each question has a time limit</li>
            <li>If time runs out, your current answer will be automatically submitted</li>
            <li>You cannot go back to previous questions once submitted</li>
            <li>You need to score at least 70% to pass</li>
          </ul>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Note</AlertTitle>
          <AlertDescription>
            Once you start the quiz, do not refresh the page or navigate away as it may result in losing your progress.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button className="w-full" onClick={onStart}>
          Start Quiz
        </Button>
        <Button variant="outline" onClick={() => navigate("/training")}>
          Return to Training
        </Button>
      </CardFooter>
    </Card>
  );
};
