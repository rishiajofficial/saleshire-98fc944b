
import React from 'react';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import ErrorMessage from '@/components/ui/error-message';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { NotificationsCard } from '@/components/dashboard/NotificationsCard';
import { HiringJourneyCard } from '@/components/dashboard/HiringJourneyCard';
import { TrainingCard } from '@/components/dashboard/TrainingCard';
import { ApplicationPrompt } from '@/components/dashboard/ApplicationPrompt';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useCandidateDashboardState } from '@/hooks/useCandidateDashboardState';

const CandidateDashboard = () => {
  const { profile, user } = useAuth();
  
  const {
    loading,
    error,
    candidateData,
    notifications,
    applicationSubmitted,
    currentStep,
    trainingModules,
    isLoadingTraining,
    showApplicationPrompt,
    canAccessTraining,
  } = useCandidateDashboardState(user?.id);

  if (loading) {
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

  // Main content components
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

  // Sidebar content components
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
