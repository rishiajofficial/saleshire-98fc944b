
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Calendar } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StepDetails } from "@/hooks/useCandidateDashboardState";

interface HiringJourneyCardProps {
  currentStep: number;
  applicationSubmitted: boolean;
  stepDetails: StepDetails[];
  interviewDate?: string;
}

export const HiringJourneyCard = ({ 
  currentStep, 
  applicationSubmitted, 
  stepDetails,
  interviewDate 
}: HiringJourneyCardProps) => {
  const isMobile = useIsMobile();
  
  // Mobile-focused design using simple vertical steps
  if (isMobile) {
    // Get the active step detail
    const activeStep = stepDetails.find(step => step.isActive) || stepDetails[0];
    
    const renderMobileStepContent = () => {
      switch (activeStep.id) {
        case 1: // Job Openings / Application
          return (
            <div className="text-center">
              <h3 className="text-lg font-medium mb-3">Start Your Journey</h3>
              <p className="text-sm text-gray-600 mb-4">
                Browse available positions and submit your application
              </p>
              <Button asChild className="w-full">
                <Link to="/job-openings">View Job Openings</Link>
              </Button>
            </div>
          );
        
        case 2: // HR Review
          return (
            <div className="text-center">
              <h3 className="text-lg font-medium mb-3">Application Under Review</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our HR team is currently reviewing your application. 
                You'll be notified once it's approved.
              </p>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                HR Review in Progress
              </Badge>
            </div>
          );
        
        case 3: // Training
          return (
            <div className="text-center">
              <h3 className="text-lg font-medium mb-3">Training Required</h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete the required training modules to proceed with the hiring process.
              </p>
              <Button asChild className="w-full">
                <Link to="/training">Go to Training</Link>
              </Button>
            </div>
          );
        
        case 4: // Interview
          return (
            <div className="text-center">
              <h3 className="text-lg font-medium mb-3">Interview Stage</h3>
              {interviewDate ? (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <Calendar className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium">Scheduled: {interviewDate}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Your interview has been scheduled. Please be prepared at the designated time.
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-600 mb-4">
                  The hiring manager will schedule an interview with you soon.
                </p>
              )}
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Interview {interviewDate ? 'Scheduled' : 'Pending'}
              </Badge>
            </div>
          );
        
        case 5: // Paid Project
          return (
            <div className="text-center">
              <h3 className="text-lg font-medium mb-3">Paid Project Phase</h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete the assigned project to demonstrate your skills.
              </p>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Project in Progress
              </Badge>
            </div>
          );
        
        default:
          return (
            <div className="text-center">
              <h3 className="text-lg font-medium mb-3">Start Your Journey</h3>
              <p className="text-sm text-gray-600 mb-4">
                Browse available positions and submit your application
              </p>
              <Button asChild className="w-full">
                <Link to="/job-openings">View Job Openings</Link>
              </Button>
            </div>
          );
      }
    };
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Hiring Journey</CardTitle>
          <CardDescription>
            Current Step: {activeStep.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            {stepDetails.map((step, index) => (
              <div 
                key={step.id} 
                className={`w-2 h-2 rounded-full ${
                  step.isCompleted ? 'bg-green-500' :
                  step.isActive ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {renderMobileStepContent()}
        </CardContent>
      </Card>
    );
  }

  // Desktop design with horizontal timeline
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Hiring Journey</CardTitle>
        <CardDescription>
          Track your progress through the hiring process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="w-full absolute top-4 left-0 right-0">
              <div className="h-1 bg-secondary w-full"></div>
            </div>
            {stepDetails.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center z-10"
                style={{ width: "20%" }}
              >
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={`flex items-center justify-center h-8 w-8 rounded-full text-sm transition-colors duration-300 ${
                        step.isCompleted
                          ? "bg-green-500 text-white"
                          : step.isActive
                          ? "bg-primary text-white ring-2 ring-primary/50 ring-offset-2"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{step.name}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </TooltipContent>
                </Tooltip>
                <p className={`mt-2 text-xs font-medium ${step.isActive || step.isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
