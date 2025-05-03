
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCandidateDashboardData } from './useCandidateDashboardData';
import { useTrainingModules } from './useTrainingModules';

export function useCandidateDashboardState(userId?: string) {
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id;
  
  // Get dashboard data
  const dashboardState = useCandidateDashboardData(effectiveUserId);
  
  // Get training modules using the consistent useTrainingModules hook
  const trainingState = useTrainingModules();
  
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
      (dashboardState.candidateData?.status?.toLowerCase() === 'applied' || 
       dashboardState.candidateData?.status?.toLowerCase() === 'screening'),
    canAccessTraining,
    
    // Actions
    refetch: dashboardState.refetch,
  };
}
