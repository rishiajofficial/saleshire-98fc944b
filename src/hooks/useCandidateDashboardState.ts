
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardState {
  loading: boolean;
  error: string | null;
  candidateData: any;
  applicationSubmitted: boolean;
  currentStep: number;
  canAccessTraining: boolean;
}

export const useCandidateDashboardState = (userId: string | undefined, jobId?: string) => {
  const [state, setState] = useState<DashboardState>({
    loading: true,
    error: null,
    candidateData: null,
    applicationSubmitted: false,
    currentStep: 0,
    canAccessTraining: false,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId || !jobId) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: "Missing user ID or job ID",
          candidateData: null,
          applicationSubmitted: false,
          currentStep: 0,
          canAccessTraining: false,
        }));
        return;
      }

      try {
        console.log("Dashboard: Fetching data for user:", userId, "job:", jobId);
        
        // Reset state to loading when starting new fetch
        setState(prev => ({ 
          ...prev, 
          loading: true, 
          error: null,
          candidateData: null,
          applicationSubmitted: false,
          currentStep: 0,
          canAccessTraining: false,
        }));

        // Fetch job-specific application data
        const { data: jobAppData, error: jobAppError } = await supabase
          .from('job_applications')
          .select('*')
          .eq('candidate_id', userId)
          .eq('job_id', jobId)
          .single();

        if (jobAppError && jobAppError.code !== 'PGRST116') {
          throw new Error(`Job application fetch failed: ${jobAppError.message}`);
        }

        // Fetch candidate data
        const { data: candidateData, error: candidateError } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', userId)
          .single();

        if (candidateError && candidateError.code !== 'PGRST116') {
          throw new Error(`Candidate data fetch failed: ${candidateError.message}`);
        }

        // Check if application is complete for this specific job
        const applicationSubmitted = 
          !!candidateData?.resume && 
          !!candidateData?.about_me_video && 
          !!candidateData?.phone &&
          !!candidateData?.location &&
          !!jobAppData; // Application record exists for this job

        // Determine current step based on job-specific application status
        let currentStep = 1; // Default to application step
        let canAccessTraining = false;
        
        if (applicationSubmitted) {
          // Application is complete for this job, move to assessment step
          currentStep = 2;
          
          // Check assessment results for this specific job/candidate combination
          const { data: assessmentData, error: assessmentError } = await supabase
            .from('assessment_results')
            .select('score, completed')
            .eq('candidate_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);

          // If assessment is completed with passing score (50%+), unlock training
          if (!assessmentError && assessmentData && assessmentData.length > 0) {
            const latestAssessment = assessmentData[0];
            if (latestAssessment.completed && latestAssessment.score >= 50) {
              currentStep = 3; // Move to training step
              canAccessTraining = true;
            }
          }
          
          // Further progression based on job application status
          if (jobAppData?.status === 'manager_interview') {
            currentStep = 4;
          } else if (jobAppData?.status === 'paid_project' || jobAppData?.status === 'sales_task') {
            currentStep = 5;
          } else if (jobAppData?.status === 'hired') {
            currentStep = 6;
          }
        }

        setState({
          loading: false,
          error: null,
          candidateData: {
            ...candidateData,
            status: jobAppData?.status || candidateData?.status,
          },
          applicationSubmitted,
          currentStep,
          canAccessTraining,
        });

      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message || "Failed to load dashboard data.",
          candidateData: null,
          applicationSubmitted: false,
          currentStep: 0,
          canAccessTraining: false,
        }));
      }
    };

    fetchDashboardData();
  }, [userId, jobId]); // Re-fetch when jobId changes to ensure job-specific data

  const refetch = () => {
    setState(prev => ({ ...prev, loading: true }));
  };

  return {
    ...state,
    refetch
  };
};
