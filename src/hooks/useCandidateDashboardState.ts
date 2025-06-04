import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useCandidateDashboardData } from './useCandidateDashboardData';
import { useTrainingModules } from './useTrainingModules';
import { TrainingModuleProgress } from '@/types/training';

export interface StepDetails {
  id: number;
  name: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

export function useCandidateDashboardState(userId?: string, selectedJobId?: string) {
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id;
  
  // Get dashboard data
  const dashboardState = useCandidateDashboardData(effectiveUserId, selectedJobId);
  
  // Get training modules using the consistent useTrainingModules hook
  const trainingState = useTrainingModules(selectedJobId);
  
  const isLoading = dashboardState.loading || trainingState.loading;
  const error = dashboardState.error || null;
  
  // Map candidate status to current step (updated for 4-step process)
  const getCurrentStep = () => {
    const status = dashboardState.candidateData?.status;
    
    if (!dashboardState.applicationSubmitted) {
      return 1; // Submit Application
    }
    
    switch (status) {
      case 'applied':
      case 'hr_review':
        return 2; // Complete Assessment (but may be under HR review)
      case 'hr_approved':
      case 'training':
        return 3; // Training Modules
      case 'manager_interview':
        return 4; // Manager Interview
      case 'hired':
        return 5; // Completed (beyond the 4 steps)
      default:
        return dashboardState.applicationSubmitted ? 2 : 1;
    }
  };

  const currentStep = getCurrentStep();
  
  // Determine if user can access training/assessment
  const canAccessTraining = 
    (dashboardState.candidateData?.status === 'hr_approved' || 
     dashboardState.candidateData?.status === 'training' ||
     currentStep >= 3);

  // Calculate detailed step information for a 4-step journey
  const stepDetails: StepDetails[] = [
    {
      id: 1,
      name: 'Application',
      description: 'Submit profile and documents',
      isCompleted: dashboardState.applicationSubmitted,
      isActive: currentStep === 1
    },
    {
      id: 2,
      name: 'Assessment',
      description: 'Complete initial assessment',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2
    },
    {
      id: 3,
      name: 'Training',
      description: 'Complete required modules',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3
    },
    {
      id: 4,
      name: 'Interview',
      description: 'Meet with hiring manager',
      isCompleted: currentStep > 4,
      isActive: currentStep === 4
    }
  ];

  return {
    // Dashboard data
    loading: isLoading,
    error: error,
    candidateData: dashboardState.candidateData,
    notifications: dashboardState.notifications,
    applicationSubmitted: dashboardState.applicationSubmitted,
    currentStep,
    
    // Training data
    trainingModules: trainingState.modules,
    isLoadingTraining: trainingState.loading,
    
    // Step details
    stepDetails,
    
    // Computed properties
    showApplicationPrompt: 
      !dashboardState.applicationSubmitted && 
      (dashboardState.candidateData?.status?.toLowerCase() === 'applied' || 
       dashboardState.candidateData?.status?.toLowerCase() === 'screening'),
    canAccessTraining,
    
    // Actions
    refetch: dashboardState.refetch,
  };
}
