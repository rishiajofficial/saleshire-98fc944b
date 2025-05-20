
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/auth';
import ErrorMessage from '@/components/ui/error-message';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { NotificationsCard } from '@/components/dashboard/NotificationsCard';
import { HiringJourneyCard } from '@/components/dashboard/HiringJourneyCard';
import { TrainingCard } from '@/components/dashboard/TrainingCard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useCandidateDashboardState } from '@/hooks/useCandidateDashboardState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHamburgerNav } from '@/components/layout/navigation/mobile-hamburger-nav';

const CandidateDashboard = () => {
  const { profile, user } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);
  const [userJobs, setUserJobs] = useState<{id: string, title: string}[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [interviewDate, setInterviewDate] = useState<string | undefined>(undefined);
  const isMobile = useIsMobile();
  
  const {
    loading,
    error,
    candidateData,
    notifications,
    applicationSubmitted,
    currentStep,
    trainingModules,
    isLoadingTraining,
    canAccessTraining,
    stepDetails,
  } = useCandidateDashboardState(user?.id, selectedJobId);

  // Fetch user's job applications and interview date
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingJobs(true);
        
        // Get user's job applications with job details
        const { data, error } = await supabase
          .from('job_applications')
          .select(`
            job_id,
            jobs:job_id (
              id,
              title
            ),
            interview_datetime
          `)
          .eq('candidate_id', user.id);
          
        if (error) throw error;
        
        const jobs = data?.map(item => ({
          id: item.job_id,
          title: item.jobs?.title || 'Untitled Job'
        })) || [];
        
        setUserJobs(jobs);
        
        // Set default selected job if we have jobs and none is selected
        if (jobs.length > 0 && !selectedJobId) {
          setSelectedJobId(jobs[0].id);
        }
        
        // Get interview date if available
        const interview = data?.find(item => item.interview_datetime);
        if (interview?.interview_datetime) {
          const date = new Date(interview.interview_datetime);
          setInterviewDate(date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
        }
        
      } catch (err) {
        console.error("Error fetching user jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    };
    
    fetchUserData();
  }, [user?.id]);

  if (loading || loadingJobs) {
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
      {!isMobile && userJobs.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select Job Application</CardTitle>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a job application" />
              </SelectTrigger>
              <SelectContent>
                {userJobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
        </Card>
      )}
      <HiringJourneyCard 
        currentStep={currentStep}
        applicationSubmitted={applicationSubmitted}
        stepDetails={stepDetails}
        interviewDate={interviewDate}
      />
      {(!isMobile || (isMobile && currentStep === 3)) && (
        <TrainingCard 
          canAccessTraining={canAccessTraining}
          trainingModules={trainingModules}
          isLoadingTraining={isLoadingTraining}
        />
      )}
    </>
  );

  // Sidebar content components - only shown on desktop
  const sideContent = !isMobile ? (
    <>
      <StatusCard 
        currentStep={currentStep}
        candidateStatus={candidateData?.status}
      />
      <NotificationsCard 
        notifications={notifications}
      />
    </>
  ) : null;

  return (
    <MainLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-8">
          {isMobile && <MobileHamburgerNav />}
          {!isMobile && <DashboardHeader userName={profile?.name} userRole={profile?.role} />}
          <DashboardLayout sideContent={sideContent}>
            {mainContent}
          </DashboardLayout>
        </div>
      </TooltipProvider>
    </MainLayout>
  );
};

export default CandidateDashboard;
