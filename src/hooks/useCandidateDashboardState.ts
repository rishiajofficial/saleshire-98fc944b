
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

        // Fetch job application data
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

        // Check if application is complete (all required documents uploaded)
        const applicationSubmitted = 
          !!candidateData?.resume && 
          !!candidateData?.about_me_video && 
          !!candidateData?.phone &&
          !!candidateData?.location;

        // Determine current step based on application status and completion
        let currentStep = 1; // Default to application step
        let canAccessTraining = false;
        
        if (jobAppData && applicationSubmitted) {
          // Application is complete, move to assessment step
          currentStep = 2;
          
          // Check if candidate has completed assessment with good score
          // This would be determined by assessment results (simplified logic here)
          if (jobAppData.status === 'training' || 
              jobAppData.status === 'manager_interview' ||
              jobAppData.status === 'paid_project' ||
              jobAppData.status === 'sales_task' ||
              jobAppData.status === 'hired') {
            currentStep = 3; // Move to training step
            canAccessTraining = true;
          }
          
          // Further progression based on status
          if (jobAppData.status === 'manager_interview') {
            currentStep = 4;
          } else if (jobAppData.status === 'paid_project' || jobAppData.status === 'sales_task') {
            currentStep = 5;
          } else if (jobAppData.status === 'hired') {
            currentStep = 6;
          }
        } else if (applicationSubmitted && !jobAppData) {
          // Application complete but no job application record - stay on step 2
          currentStep = 2;
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
  }, [userId, jobId]);

  const refetch = () => {
    setState(prev => ({ ...prev, loading: true }));
  };

  return {
    ...state,
    refetch
  };
};
