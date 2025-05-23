
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Loading from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error-message';

const AssessmentResult = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<any>(null);

  React.useEffect(() => {
    // Simulate loading assessment result
    const timer = setTimeout(() => {
      if (resultId === 'error') {
        setError('Failed to load assessment result');
      } else {
        setResult({
          score: 85,
          passed: true,
          totalQuestions: 10,
          correctAnswers: 8.5,
          completedAt: new Date().toISOString(),
        });
      }
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resultId]);

  if (loading) {
    return (
      <MainLayout>
        <Loading message="Loading assessment results..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ErrorMessage 
          title="Error Loading Results" 
          message={error}
          backUrl="/training"
          backLabel="Return to Training"
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Assessment Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className="text-5xl font-bold text-primary mb-2">
                  {result.score}%
                </div>
                <div className={`text-lg font-medium ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.passed ? 'Passed' : 'Failed'}
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Questions:</span>
                  <span className="font-medium">{result.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correct Answers:</span>
                  <span className="font-medium">{result.correctAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-medium">
                    {new Date(result.completedAt).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="pt-6 text-center">
                <Button onClick={() => navigate('/training')}>
                  Return to Training
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
