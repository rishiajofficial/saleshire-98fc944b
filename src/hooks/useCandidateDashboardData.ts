
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

type CandidateProfile = Tables<'candidates'>;
type AssessmentResult = Tables<'assessment_results'> & { profiles?: { name?: string | null } | null };
type ActivityLog = Tables<'activity_logs'>;

interface DashboardState {
  loading: boolean;
  error: string | null;
  candidateData: CandidateProfile | null;
  assessmentResults: AssessmentResult[];
  notifications: ActivityLog[];
  applicationSubmitted: boolean;
  currentStep: number;
}

export const useCandidateDashboardData = (userId: string | undefined, jobId?: string) => {
  const [state, setState] = useState<DashboardState>({
    loading: true,
    error: null,
    candidateData: null,
    assessmentResults: [],
    notifications: [],
    applicationSubmitted: false,
    currentStep: 0,
  });

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const fetchDashboardData = async () => {
      if (!userId) {
        setState(prev => ({ ...prev, loading: false, error: "User not logged in" }));
        return;
      }

      if (state.candidateData === null) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      try {
        console.log("Dashboard: Fetching data for user:", userId, "job:", jobId);

        // First fetch user's job application details if a job ID is provided
        let applicationData: any = null;
        if (jobId) {
          const { data: jobAppData, error: jobAppError } = await supabase
            .from('job_applications')
            .select('*')
            .eq('candidate_id', userId)
            .eq('job_id', jobId)
            .single();

          if (jobAppError && jobAppError.code !== 'PGRST116') {
            console.error("Job application fetch error:", jobAppError.message);
          } else {
            applicationData = jobAppData;
          }
        }

        const [candidateResult, resultsResult, notificationResult] = await Promise.all([
          supabase
            .from('candidates')
            .select('*')
            .eq('id', userId)
            .single(),
          supabase
            .from('assessment_results')
            .select('*')
            .eq('candidate_id', userId)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10)
        ]);

        if (candidateResult.error && candidateResult.error.code !== 'PGRST116') {
          throw new Error(`Candidate data fetch failed: ${candidateResult.error.message}`);
        }
        if (resultsResult.error) {
          throw new Error(`Assessment results fetch failed: ${resultsResult.error.message}`);
        }
        if (notificationResult.error) {
          console.error("Notifications fetch failed:", notificationResult.error.message);
        }

        const fetchedCandidateData = candidateResult.data;
        const assessmentResults = resultsResult.data || [];
        const notifications = notificationResult.data || [];
        
        // Use job application status if available, otherwise use candidate status
        const effectiveStatus = applicationData?.status || fetchedCandidateData?.status;
        
        const applicationSubmitted = 
          !!fetchedCandidateData?.resume && 
          !!fetchedCandidateData?.about_me_video && 
          !!fetchedCandidateData?.sales_pitch_video;
        
        // Use job application step if available, otherwise use candidate step
        let currentStep = applicationData?.current_step ?? fetchedCandidateData?.current_step ?? 0;
        if (applicationSubmitted && currentStep === 0) {
          currentStep = 1;
        }
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          candidateData: {
            ...fetchedCandidateData,
            status: effectiveStatus,
          },
          assessmentResults,
          notifications,
          applicationSubmitted,
          currentStep,
        }));

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

    if (userId) {
      console.log("Setting up realtime subscription for candidate:", userId);
      channel = supabase
        .channel(`candidate_updates_${userId}`)
        .on<CandidateProfile>(
          'postgres_changes',
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'candidates', 
            filter: `id=eq.${userId}`
          },
          (payload) => {
            console.log('Realtime candidate update received:', payload.new);
            const updatedCandidateData = payload.new as CandidateProfile;
            const applicationSubmitted = 
              !!updatedCandidateData?.resume && 
              !!updatedCandidateData?.about_me_video && 
              !!updatedCandidateData?.sales_pitch_video;
            const currentStep = updatedCandidateData?.current_step ?? (applicationSubmitted ? 1 : 0);
            
            setState(prev => ({
              ...prev,
              candidateData: updatedCandidateData,
              applicationSubmitted,
              currentStep,
              loading: false,
              error: null
            }));
            toast.info("Your application status has been updated!");
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('Realtime channel subscribed successfully!');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Realtime channel error:', err);
            toast.error('Connection issue: Dashboard might not update instantly.');
          }
        });

      // Also subscribe to job application updates if jobId is provided
      if (jobId) {
        const jobAppChannel = supabase
          .channel(`job_app_updates_${userId}_${jobId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'job_applications',
              filter: `candidate_id=eq.${userId} AND job_id=eq.${jobId}`
            },
            (payload) => {
              console.log('Realtime job application update received:', payload.new);
              fetchDashboardData(); // Refresh data when job application is updated
              toast.info("Your job application status has been updated!");
            }
          )
          .subscribe();

        // Cleanup function will handle this channel too
        const originalChannel = channel;
        channel = {
          unsubscribe: () => {
            originalChannel.unsubscribe();
            jobAppChannel.unsubscribe();
          }
        } as any;
      }
    }

    return () => {
      if (channel) {
        console.log("Unsubscribing from realtime channel.");
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, [userId, jobId]);

  const refetch = () => {
    setState(prev => ({ ...prev, loading: true }));
  };

  return {
    ...state,
    refetch
  };
};
