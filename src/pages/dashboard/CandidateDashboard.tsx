
import React from 'react';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainingModulesList } from '@/hooks/training/useTrainingModulesList';
import { useCandidateDashboardData } from '@/hooks/useCandidateDashboardData';
import ErrorMessage from '@/components/ui/error-message';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { NotificationsCard } from '@/components/dashboard/NotificationsCard';
import { HiringJourneyCard } from '@/components/dashboard/HiringJourneyCard';
import { TrainingCard } from '@/components/dashboard/TrainingCard';
import { ApplicationPrompt } from '@/components/dashboard/ApplicationPrompt';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';

const CandidateDashboard = () => {
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
    modules: trainingModules, 
    loading: isLoadingTraining, 
    error: trainingError,
  } = useTrainingModulesList();

  const isLoading = dashboardLoading || isLoadingTraining;
  const error = dashboardError || trainingError;

  React.useEffect(() => {
    if (trainingError) {
      console.error("Training modules error:", trainingError);
      toast.error("Failed to load training modules");
    }
  }, [trainingError]);

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

  const mainContent = (
    <>
      <HiringJourneyCard 
        currentStep={currentStep}
        applicationSubmitted={applicationSubmitted}
      />
      <TrainingCard 
        canAccessTraining={canAccessTraining}
        trainingModules={trainingModules}
        isLoadingTraining={isLoadingTraining}
      />
    </>
  );

  const sideContent = (
    <>
      <StatusCard 
        currentStep={currentStep}
        candidateStatus={candidateData?.status}
      />
      <NotificationsCard 
        notifications={notifications}
      />
    </>
  );

  return (
    <MainLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-8 space-y-8">
          <DashboardHeader userName={profile?.name} />
          {showApplicationPrompt && <ApplicationPrompt />}
          <DashboardLayout sideContent={sideContent}>
            {mainContent}
          </DashboardLayout>
        </div>
      </TooltipProvider>
    </MainLayout>
  );
};

export default CandidateDashboard;
