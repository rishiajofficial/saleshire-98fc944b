
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface HiringJourneyCardProps {
  currentStep: number;
  applicationSubmitted: boolean;
}

export const HiringJourneyCard = ({ currentStep, applicationSubmitted }: HiringJourneyCardProps) => {
  const isMobile = useIsMobile();
  
  // Define steps with their details
  const steps = [
    {
      id: "application",
      number: 1,
      title: "Application",
      description: "Submit your profile and documents",
      status: applicationSubmitted ? 'completed' : (currentStep === 1 ? 'in_progress' : 'pending')
    },
    {
      id: "hrReview",
      number: 2,
      title: "HR Review",
      description: "HR team reviews your application",
      status: currentStep > 2 ? 'completed' : (currentStep === 2 ? 'in_progress' : 'pending')
    },
    {
      id: "training",
      number: 3,
      title: "Training",
      description: "Complete required training modules",
      status: currentStep > 3 ? 'completed' : (currentStep === 3 ? 'in_progress' : 'pending')
    },
    {
      id: "managerInterview",
      number: 4,
      title: "Interview",
      description: "Interview with hiring manager",
      status: currentStep > 4 ? 'completed' : (currentStep === 4 ? 'in_progress' : 'pending')
    },
    {
      id: "paidProject",
      number: 5,
      title: "Paid Project",
      description: "Complete a paid sample project",
      status: currentStep === 5 ? 'in_progress' : 'pending'
    }
  ];

  // Mobile-focused design using vertical steps
  if (isMobile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Hiring Journey</CardTitle>
          <CardDescription>
            Track your progress step by step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className={`border rounded-lg p-3 ${
                step.status === 'completed' ? 'bg-green-50 border-green-200' :
                step.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full mr-3 ${
                    step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'in_progress' ? 'bg-primary text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {step.status === 'completed' ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="ml-4 pl-4 mt-2 border-l-2 border-dashed border-gray-300 h-4"></div>
                )}
              </div>
            ))}
          </div>
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
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center z-10"
                style={{ width: "20%" }}
              >
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={`flex items-center justify-center h-8 w-8 rounded-full text-sm transition-colors duration-300 ${
                        step.status === "completed"
                          ? "bg-green-500 text-white"
                          : step.status === "in_progress"
                          ? "bg-primary text-white ring-2 ring-primary/50 ring-offset-2"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.status === "completed" ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </TooltipContent>
                </Tooltip>
                <p className={`mt-2 text-xs font-medium ${step.status !== 'pending' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
