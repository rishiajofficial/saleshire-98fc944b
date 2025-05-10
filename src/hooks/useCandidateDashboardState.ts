
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useCandidateDashboardData } from './useCandidateDashboardData';
import { useTrainingModules } from './useTrainingModules';
import { TrainingModuleProgress } from '@/types/training';

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
    
    // Computed properties
    showApplicationPrompt: 
      !dashboardState.applicationSubmitted && 
      (dashboardState.candidateData?.status === 'profile_created' ||
       dashboardState.candidateData?.status?.toLowerCase() === 'applied' || 
       dashboardState.candidateData?.status?.toLowerCase() === 'screening'),
    canAccessTraining,
    
    // Actions
    refetch: dashboardState.refetch,
  };
}
