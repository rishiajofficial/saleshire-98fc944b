
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
  
  // Determine if user can access training
  const canAccessTraining = 
    (dashboardState.candidateData?.status === 'hr_approved' || 
     dashboardState.candidateData?.status === 'training' ||
     dashboardState.currentStep >= 3);

  // Calculate detailed step information for a more granular journey display
  const stepDetails: StepDetails[] = [
    {
      id: 1,
      name: 'Application',
      description: 'Submit profile and documents',
      isCompleted: dashboardState.applicationSubmitted,
      isActive: dashboardState.currentStep === 1
    },
    {
      id: 2,
      name: 'HR Review',
      description: 'Application under review',
      isCompleted: dashboardState.currentStep > 2,
      isActive: dashboardState.currentStep === 2
    },
    {
      id: 3,
      name: 'Training',
      description: 'Complete required modules',
      isCompleted: dashboardState.currentStep > 3,
      isActive: dashboardState.currentStep === 3
    },
    {
      id: 4,
      name: 'Interview',
      description: 'Meet with hiring manager',
      isCompleted: dashboardState.currentStep > 4,
      isActive: dashboardState.currentStep === 4
    },
    {
      id: 5,
      name: 'Paid Project',
      description: 'Complete trial work',
      isCompleted: dashboardState.currentStep > 5,
      isActive: dashboardState.currentStep === 5
    }
  ];

  return {
    // Dashboard data
    loading: isLoading,
    error: error,
    candidateData: dashboardState.candidateData,
    notifications: dashboardState.notifications,
    applicationSubmitted: dashboardState.applicationSubmitted,
    currentStep: dashboardState.currentStep,
    
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
