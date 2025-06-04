
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
        setState(prev => ({ ...prev, loading: false, error: "Missing user ID or job ID" }));
        return;
      }

      try {
        console.log("Dashboard: Fetching data for user:", userId, "job:", jobId);

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

        // Check if application is complete
        const applicationSubmitted = 
          !!candidateData?.resume && 
          !!candidateData?.about_me_video && 
          !!candidateData?.sales_pitch_video &&
          !!candidateData?.phone &&
          !!candidateData?.location;

        // Determine current step based on application status and completion
        let currentStep = 0;
        if (jobAppData) {
          if (!applicationSubmitted) {
            // Application started but not completed
            currentStep = 1;
          } else {
            // Application completed, determine next step based on status
            switch (jobAppData.status) {
              case 'applied':
              case 'hr_review':
                currentStep = 2;
                break;
              case 'hr_approved':
              case 'training':
                currentStep = 3;
                break;
              case 'manager_interview':
                currentStep = 4;
                break;
              case 'paid_project':
              case 'sales_task':
                currentStep = 5;
                break;
              case 'hired':
                currentStep = 6;
                break;
              default:
                currentStep = applicationSubmitted ? 2 : 1;
            }
          }
        }

        const canAccessTraining = applicationSubmitted && 
          (jobAppData?.status === 'hr_approved' || jobAppData?.status === 'training');

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
          error: error.message || "Failed to load dashboard data." 
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
