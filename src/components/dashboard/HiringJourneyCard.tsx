
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HiringJourneyCardProps {
  currentStep: number;
  applicationSubmitted: boolean;
}

export const HiringJourneyCard = ({ currentStep, applicationSubmitted }: HiringJourneyCardProps) => {
  const getStepNumber = (step: string) => {
    switch (step) {
      case "application": return 1;
      case "hrReview": return 2;
      case "training": return 3;
      case "managerInterview": return 4;
      case "paidProject": return 5;
      default: return 0;
    }
  };

  const stepDisplayNames = {
    application: "Application",
    hrReview: "HR Review",
    training: "Training",
    managerInterview: "Manager Interview",
    paidProject: "Paid Project"
  };

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
            {["application", "hrReview", "training", "managerInterview", "paidProject"].map(
              (stepKey, index) => {
                const stepNumber = getStepNumber(stepKey);
                let status = 'pending';
                if (stepKey === 'application') {
                  status = applicationSubmitted ? 'completed' : (currentStep === 1 ? 'in_progress' : 'pending');
                } else if (stepNumber < currentStep) {
                  status = 'completed';
                } else if (stepNumber === currentStep) {
                  status = 'in_progress';
                }

                return (
                  <div
                    key={index}
                    className="relative flex flex-col items-center text-center z-10"
                    style={{ width: "20%" }}
                  >
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          className={`flex items-center justify-center h-8 w-8 rounded-full text-sm transition-colors duration-300 ${
                            status === "completed"
                              ? "bg-green-500 text-white"
                              : status === "in_progress"
                              ? "bg-primary text-white ring-2 ring-primary/50 ring-offset-2"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {status === "completed" ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            stepNumber
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {stepDisplayNames[stepKey as keyof typeof stepDisplayNames]} ({status})
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    <p className={`mt-2 text-xs font-medium ${status !== 'pending' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {stepDisplayNames[stepKey as keyof typeof stepDisplayNames]}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
