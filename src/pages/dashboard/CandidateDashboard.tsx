
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { useCandidateDashboardData } from '@/hooks/useCandidateDashboardData';
import ErrorMessage from '@/components/ui/error-message';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { NotificationsCard } from '@/components/dashboard/NotificationsCard';
import { HiringJourneyCard } from '@/components/dashboard/HiringJourneyCard';
import { TrainingCard } from '@/components/dashboard/TrainingCard';
import { ApplicationPrompt } from '@/components/dashboard/ApplicationPrompt';
import { TooltipProvider } from '@/components/ui/tooltip';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  
  const { 
    loading: dashboardLoading,
    error: dashboardError,
    candidateData,
    notifications,
    applicationSubmitted,
    currentStep,
  } = useCandidateDashboardData(user?.id);

  const { 
    trainingModules, 
    isLoading: isLoadingTraining, 
    error: trainingError,
  } = useTrainingProgress();

  const isLoading = dashboardLoading || isLoadingTraining;
  const error = trainingError || dashboardError;

  const showApplicationPrompt = 
    !applicationSubmitted && 
    (candidateData?.status?.toLowerCase() === 'applied' || 
     candidateData?.status?.toLowerCase() === 'screening');

  const canAccessTraining = 
    candidateData?.status === 'hr_approved' || 
    candidateData?.status === 'training' ||
    currentStep >= 3;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ErrorMessage 
          title="Error Loading Dashboard" 
          message={error} 
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Candidate Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {profile?.name || 'Candidate'}
            </p>
          </div>

          {showApplicationPrompt && <ApplicationPrompt />}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-6">
              <HiringJourneyCard 
                currentStep={currentStep}
                applicationSubmitted={applicationSubmitted}
              />

              <TrainingCard 
                canAccessTraining={canAccessTraining}
                trainingModules={trainingModules}
                isLoadingTraining={isLoadingTraining}
              />
            </div>

            <div className="md:col-span-4 space-y-6">
              <StatusCard 
                currentStep={currentStep}
                candidateStatus={candidateData?.status}
              />

              <NotificationsCard 
                notifications={notifications}
              />
            </div>
          </div>
        </div>
      </TooltipProvider>
    </MainLayout>
  );
};

export default CandidateDashboard;
