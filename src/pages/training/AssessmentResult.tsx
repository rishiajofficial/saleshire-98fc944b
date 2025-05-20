
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Award, ChevronLeft } from 'lucide-react';

const AssessmentResult = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  
  // In a real application, you would fetch the actual assessment result using resultId
  // For now, we'll use a mock result
  const mockResult = {
    score: 85,
    passed: true,
    totalQuestions: 10,
    correctAnswers: 8,
    assessmentName: 'Sales Training Assessment',
    completionDate: new Date().toLocaleDateString(),
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/training')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Training
        </Button>
        
        <Card className="max-w-2xl mx-auto border-2 border-gray-100 shadow-md">
          <CardHeader className="text-center bg-slate-50 border-b pb-6">
            <div className="flex justify-center mb-4">
              {mockResult.passed ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : (
                <Award className="h-12 w-12 text-amber-500" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">Assessment Results</CardTitle>
            <p className="text-muted-foreground">{mockResult.assessmentName}</p>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{mockResult.score}%</div>
                <p className="text-lg font-medium text-green-600">
                  {mockResult.passed ? 'Passed' : 'Failed'}
                </p>
              </div>
              
              <div className="border-t border-b py-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correct Answers:</span>
                  <span className="font-medium">{mockResult.correctAnswers} of {mockResult.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completion Date:</span>
                  <span className="font-medium">{mockResult.completionDate}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/training')}
                >
                  Return to Training
                </Button>
                <Button onClick={() => navigate('/dashboard/candidate')}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AssessmentResult;
