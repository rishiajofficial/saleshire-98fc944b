
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

interface QuizResultsProps {
  score: number;
  onRetry: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ score, onRetry }) => {
  const navigate = useNavigate();
  const passed = score >= 70;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Quiz Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          {passed ? (
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
          )}
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">
            {passed ? "Congratulations!" : "Almost There!"}
          </h2>
          <p className="text-muted-foreground">
            {passed 
              ? "You've successfully completed this module." 
              : "You need to score at least 70% to pass this module."}
          </p>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold">
            {score}%
          </div>
          <p className="text-sm text-muted-foreground">
            Your Score
          </p>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="font-medium mb-2">Key Takeaways:</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Review the module content again to reinforce your knowledge</li>
            <li>Practice applying the concepts in real-world scenarios</li>
            <li>Ask your trainer if you have any specific questions</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {!passed ? (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Quiz
          </Button>
        ) : (
          <Button variant="outline" onClick={() => navigate('/training')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Training
          </Button>
        )}
        
        <Button 
          onClick={() => navigate('/dashboard/candidate')}
          variant={passed ? "default" : "outline"}
        >
          Go to Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
};
