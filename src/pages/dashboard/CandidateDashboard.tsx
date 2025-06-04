
import React, { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/auth';
import ErrorMessage from '@/components/ui/error-message';
import { HiringWizard } from '@/components/candidate/HiringWizard';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useCandidateDashboardState } from '@/hooks/useCandidateDashboardState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const CandidateDashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);
  const [userJobs, setUserJobs] = useState<{id: string, title: string}[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  
  const {
    loading,
    error,
    candidateData,
    applicationSubmitted,
    currentStep,
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

  // If no applications, show apply to job prompt
  if (userJobs.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome, {profile?.name}!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Ready to start your journey with us? Apply to an open position to begin.
              </p>
            </div>
            
            <Card className="p-8">
              <CardContent className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Apply to a Job</h2>
                <p className="text-gray-600">
                  Browse our open positions and submit your application to get started.
                </p>
                <Button 
                  size="lg" 
                  className="mt-4"
                  onClick={() => navigate('/careers')}
                >
                  View Open Positions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  // If has applications, show application selector and wizard
  return (
    <MainLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Application Selector */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Your Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Application to View Progress
                </label>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an application" />
                  </SelectTrigger>
                  <SelectContent>
                    {userJobs.map(job => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/careers')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Apply to Another Job
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hiring Wizard */}
          {selectedJobId && (
            <HiringWizard 
              currentStep={currentStep}
              applicationSubmitted={applicationSubmitted}
              canAccessTraining={canAccessTraining}
              candidateStatus={candidateData?.status}
            />
          )}
        </div>
      </TooltipProvider>
    </MainLayout>
  );
};

export default CandidateDashboard;
