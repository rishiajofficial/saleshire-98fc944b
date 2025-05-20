
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, Clock } from 'lucide-react';

const ApplicationComplete = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="container max-w-md mx-auto pt-8 px-4">
        <Card className="border-green-100 bg-white">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center text-xl">Application Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p>
                Thank you for submitting your application. Your profile has been received.
              </p>
              
              <div className="bg-blue-50 rounded-md p-4 flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-medium text-blue-800">Under HR Review</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Our HR team is currently reviewing your application. 
                    You'll be notified when there's an update on your status.
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                You can track your application progress in your dashboard.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate('/dashboard/candidate')}
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ApplicationComplete;
