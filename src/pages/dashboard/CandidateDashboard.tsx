
import React, { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import ErrorMessage from '@/components/ui/error-message';
import { HiringWizard } from '@/components/candidate/HiringWizard';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useCandidateDashboardState } from '@/hooks/useCandidateDashboardState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CandidateNavbar from '@/components/layout/CandidateNavbar';

const CandidateDashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Handle URL parameters for job selection and step navigation
  useEffect(() => {
    const jobFromUrl = searchParams.get('job');
    const stepFromUrl = searchParams.get('step');
    
    if (jobFromUrl && !selectedJobId) {
      setSelectedJobId(jobFromUrl);
    }
    
    // If step is assessment, navigate to training page with assessment tab
    if (stepFromUrl === 'assessment' && jobFromUrl) {
      navigate('/training?tab=assessment');
    }
  }, [searchParams, selectedJobId, navigate]);

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
          const jobFromUrl = searchParams.get('job');
          const defaultJobId = jobFromUrl || jobs[0].id;
          setSelectedJobId(defaultJobId);
        }
        
      } catch (err) {
        console.error("Error fetching user jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    };
    
    fetchUserJobs();
  }, [user?.id, searchParams]);

  // Handle job selection change
  const handleJobSelectionChange = (jobId: string) => {
    console.log("Job selection changed to:", jobId);
    setSelectedJobId(jobId);
    // Clear URL params when manually selecting a different job
    setSearchParams({});
  };

  if (loadingJobs) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CandidateNavbar />
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CandidateNavbar />
        <ErrorMessage 
          title="Error Loading Dashboard" 
          message={error} 
        />
      </div>
    );
  }

  // If no applications, show apply to job prompt
  if (userJobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CandidateNavbar />
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
                  onClick={() => navigate('/candidate/jobs')}
                >
                  View Open Positions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // If has applications, show application selector and wizard
  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateNavbar />
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
                <Select value={selectedJobId} onValueChange={handleJobSelectionChange}>
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
                  onClick={() => navigate('/candidate/jobs')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Apply to Another Job
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Show loading state while fetching data for selected job */}
          {loading && selectedJobId && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Hiring Wizard - only show when not loading and has selected job */}
          {!loading && selectedJobId && (
            <HiringWizard 
              currentStep={currentStep}
              applicationSubmitted={applicationSubmitted}
              canAccessTraining={canAccessTraining}
              candidateStatus={candidateData?.status}
            />
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default CandidateDashboard;
