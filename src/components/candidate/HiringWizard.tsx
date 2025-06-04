
import React, { useState } from 'react';
import { Check, Clock, Lock, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'locked';
  action?: string;
  actionPath?: string;
  estimatedTime?: string;
}

interface HiringWizardProps {
  currentStep: number;
  applicationSubmitted: boolean;
  canAccessTraining: boolean;
  candidateStatus?: string;
}

export const HiringWizard = ({ 
  currentStep, 
  applicationSubmitted, 
  canAccessTraining,
  candidateStatus 
}: HiringWizardProps) => {
  const navigate = useNavigate();
  const [showAllSteps, setShowAllSteps] = useState(false);

  const getStepStatus = (stepId: number): 'completed' | 'current' | 'pending' | 'locked' => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    if (stepId === currentStep + 1) return 'pending';
    return 'locked';
  };

  const steps: WizardStep[] = [
    {
      id: 1,
      title: 'Submit Application',
      description: 'Complete your profile, upload documents, and submit your application',
      status: getStepStatus(1),
      action: applicationSubmitted ? undefined : 'Complete Application',
      actionPath: '/application',
      estimatedTime: '10-15 minutes'
    },
    {
      id: 2,
      title: 'Complete Assessment',
      description: 'Take the required assessment test to demonstrate your skills',
      status: getStepStatus(2),
      action: canAccessTraining && currentStep === 2 ? 'Take Assessment' : undefined,
      actionPath: '/training',
      estimatedTime: '30-45 minutes'
    },
    {
      id: 3,
      title: 'Training Modules',
      description: 'Complete required training modules and knowledge assessments',
      status: getStepStatus(3),
      action: canAccessTraining && currentStep === 3 ? 'Start Training' : undefined,
      actionPath: '/training',
      estimatedTime: '2-3 hours'
    },
    {
      id: 4,
      title: 'Manager Interview',
      description: 'Schedule and attend your interview with the hiring manager',
      status: getStepStatus(4),
      estimatedTime: '30-45 minutes'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'locked':
        return <Lock className="h-5 w-5 text-gray-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-200';
      case 'current':
        return 'bg-blue-100 border-blue-200';
      case 'pending':
        return 'bg-orange-50 border-orange-200';
      case 'locked':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getInstructions = (step: WizardStep) => {
    switch (step.status) {
      case 'completed':
        return '✅ Step completed successfully';
      case 'current':
        if (step.id === 2 && candidateStatus === 'hr_review') {
          return '⏳ Your application is under review. Assessment will be available once approved.';
        }
        return '👉 This is your current step. Complete the required actions to proceed.';
      case 'pending':
        return '⏳ Complete the previous step to unlock this stage.';
      case 'locked':
        return '🔒 This step will be available after completing previous stages.';
      default:
        return '';
    }
  };

  const currentActiveStep = steps.find(step => step.status === 'current');
  const stepsToShow = showAllSteps ? steps : (currentActiveStep ? [currentActiveStep] : steps);

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Hiring Journey</h2>
        <p className="text-gray-600">Follow these steps to complete your application process</p>
        <div className="mt-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="text-sm text-gray-500">Progress:</div>
            <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
            <div className="text-sm font-medium text-gray-700">{currentStep}/4</div>
          </div>
        </div>
      </div>

      {/* Toggle button for viewing all steps */}
      <div className="flex justify-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAllSteps(!showAllSteps)}
          className="flex items-center gap-2"
        >
          {showAllSteps ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show Current Step Only
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              View All Steps
            </>
          )}
        </Button>
      </div>

      {stepsToShow.map((step, index) => (
        <Card 
          key={step.id} 
          className={`${getStatusColor(step.status)} transition-all duration-200 ${
            showAllSteps && step.status === 'locked' ? 'opacity-50' : ''
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    Step {step.id}: {step.title}
                    {step.status === 'completed' && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Complete
                      </Badge>
                    )}
                    {step.status === 'current' && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Active
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">{step.description}</p>
                  {step.estimatedTime && (
                    <p className="text-sm text-gray-500 mt-1">
                      ⏱️ Estimated time: {step.estimatedTime}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-white/60 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700 font-medium">
                {getInstructions(step)}
              </p>
            </div>
            
            {step.action && step.actionPath && step.status === 'current' && candidateStatus !== 'hr_review' && (
              <Button 
                onClick={() => navigate(step.actionPath!)}
                className="w-full flex items-center justify-center gap-2"
              >
                {step.action}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            
            {step.status === 'pending' && !step.action && (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500">
                  Complete the previous step to proceed
                </p>
              </div>
            )}
            
            {step.status === 'locked' && showAllSteps && (
              <div className="text-center py-2">
                <p className="text-sm text-gray-400">
                  This step will unlock automatically
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {candidateStatus === 'hired' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="text-center py-6">
            <div className="text-green-600 mb-2">
              <Check className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Congratulations! 🎉
            </h3>
            <p className="text-green-700">
              You have successfully completed the hiring process. Welcome to the team!
            </p>
          </CardContent>
        </Card>
      )}

      {candidateStatus === 'rejected' && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="text-center py-6">
            <h3 className="text-xl font-bold text-red-800 mb-2">
              Application Status Update
            </h3>
            <p className="text-red-700">
              Thank you for your interest. Unfortunately, we won't be moving forward with your application at this time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
