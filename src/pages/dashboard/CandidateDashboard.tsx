
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/auth';
import ErrorMessage from '@/components/ui/error-message';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { NotificationsCard } from '@/components/dashboard/NotificationsCard';
import { HiringWizard } from '@/components/candidate/HiringWizard';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useCandidateDashboardState } from '@/hooks/useCandidateDashboardState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const CandidateDashboard = () => {
  const { profile, user } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);
  const [userJobs, setUserJobs] = useState<{id: string, title: string}[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  
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
  } = useCandidateDashboardState(user?.id, selectedJobId);

  // Fetch user's job applications
  useEffect(() => {
    const fetchUserJobs = async () => {
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
            )
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
        
      } catch (err) {
        console.error("Error fetching user jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    };
    
    fetchUserJobs();
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

  return (
    <MainLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.name}!
            </h1>
            <p className="text-gray-600">
              Track your progress through our hiring process
            </p>
          </div>

          {/* Job Selection */}
          {userJobs.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Current Application</CardTitle>
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

          {/* Main Content - Mobile First Layout */}
          <div className="space-y-6">
            {/* Hiring Wizard - Primary Content */}
            <div className="order-1">
              <HiringWizard 
                currentStep={currentStep}
                applicationSubmitted={applicationSubmitted}
                canAccessTraining={canAccessTraining}
                candidateStatus={candidateData?.status}
              />
            </div>

            {/* Secondary Information - Stacked on Mobile */}
            <div className="order-2 grid gap-4 md:grid-cols-2">
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
