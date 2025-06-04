import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, FileText, GraduationCap, MessageSquare, Briefcase, Trophy, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HiringWizardProps {
  currentStep: number;
  applicationSubmitted: boolean;
  canAccessTraining: boolean;
  candidateStatus?: string | null;
}

const steps = [
  {
    id: 1,
    title: "Complete Application",
    description: "Submit your profile and documents",
    icon: FileText,
    action: "Apply",
    route: "/candidate/jobs"
  },
  {
    id: 2,
    title: "Assessment",
    description: "Complete your skills assessment",
    icon: GraduationCap,
    action: "Take Assessment",
    route: "/training"
  },
  {
    id: 3,
    title: "Training",
    description: "Complete required training modules",
    icon: MessageSquare,
    action: "Start Training",
    route: "/training"
  },
  {
    id: 4,
    title: "Interview",
    description: "Interview with hiring manager",
    icon: Briefcase,
    action: "Schedule",
    route: "/dashboard/candidate"
  },
  {
    id: 5,
    title: "Paid Project",
    description: "Complete a paid sample project",
    icon: Trophy,
    action: "View Project",
    route: "/dashboard/candidate"
  }
];

export const HiringWizard = ({ 
  currentStep, 
  applicationSubmitted, 
  canAccessTraining,
  candidateStatus 
}: HiringWizardProps) => {
  const navigate = useNavigate();

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepBadgeText = (stepId: number) => {
    const status = getStepStatus(stepId);
    switch (status) {
      case 'completed': return 'Completed';
      case 'current': return 'Current';
      default: return 'Upcoming';
    }
  };

  const handleStepAction = (step: any) => {
    const stepStatus = getStepStatus(step.id);
    
    // Only allow action on current step or completed steps
    if (stepStatus === 'upcoming') return;
    
    // Special handling for specific steps
    if (step.id === 1 && !applicationSubmitted) {
      navigate(step.route);
    } else if (step.id === 2 && stepStatus === 'current') {
      // Assessment step - should be accessible when application is completed
      navigate(step.route);
    } else if (step.id === 3 && canAccessTraining) {
      // Training step - only accessible when training is unlocked
      navigate(step.route);
    } else if (stepStatus === 'current') {
      navigate(step.route);
    }
  };

  const isStepActionable = (step: any) => {
    const stepStatus = getStepStatus(step.id);
    
    if (stepStatus === 'upcoming') return false;
    
    // Step 1: Actionable if not completed
    if (step.id === 1) return !applicationSubmitted;
    
    // Step 2: Actionable if application is completed (current step 2 or higher)
    if (step.id === 2) return applicationSubmitted && currentStep >= 2;
    
    // Step 3: Actionable if training is unlocked
    if (step.id === 3) return canAccessTraining;
    
    // Other steps: actionable if current
    return stepStatus === 'current';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Your Hiring Journey</CardTitle>
        <p className="text-gray-600 text-sm">
          Follow these steps to complete your application process
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            const isActionable = isStepActionable(step);
            
            return (
              <div
                key={step.id}
                className={`flex flex-col sm:flex-row sm:items-center p-4 rounded-lg border transition-all gap-3 sm:gap-0 ${
                  status === 'current' 
                    ? 'border-blue-200 bg-blue-50' 
                    : status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-4 flex-shrink-0 ${
                    status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : status === 'current'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {status === 'completed' ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <h3 className={`font-medium ${
                        status === 'current' ? 'text-blue-900' : 
                        status === 'completed' ? 'text-green-900' : 'text-gray-900'
                      }`}>
                        {step.title}
                      </h3>
                      <Badge 
                        variant={
                          status === 'completed' ? 'default' : 
                          status === 'current' ? 'secondary' : 'outline'
                        }
                        className={`text-xs w-fit ${
                          status === 'completed' ? 'bg-green-100 text-green-800' :
                          status === 'current' ? 'bg-blue-100 text-blue-800' : ''
                        }`}
                      >
                        {getStepBadgeText(step.id)}
                      </Badge>
                    </div>
                    <p className={`text-sm ${
                      status === 'current' ? 'text-blue-700' : 
                      status === 'completed' ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {isActionable && (
                  <div className="flex justify-end sm:ml-4">
                    <Button
                      onClick={() => handleStepAction(step)}
                      size="sm"
                      variant={status === 'current' ? 'default' : 'outline'}
                      className="w-full sm:w-auto"
                    >
                      {status === 'current' ? step.action : 'Review'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {candidateStatus && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">Current Status</h4>
            <p className="text-sm text-blue-700 capitalize">
              {candidateStatus.replace('_', ' ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
