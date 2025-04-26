
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

export const useCandidateDashboardData = (userId: string | undefined) => {
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
        console.log("Dashboard: Fetching data for user:", userId);

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
        
        const applicationSubmitted = 
          !!fetchedCandidateData?.resume && 
          !!fetchedCandidateData?.about_me_video && 
          !!fetchedCandidateData?.sales_pitch_video;
        
        const currentStep = fetchedCandidateData?.current_step ?? state.currentStep ?? (applicationSubmitted ? 1 : 0);
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          candidateData: fetchedCandidateData ?? prev.candidateData,
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

    if (!state.candidateData) {
      fetchDashboardData();
    }

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
    }

    return () => {
      if (channel) {
        console.log("Unsubscribing from realtime channel.");
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, [userId]);

  const refetch = () => {
    setState(prev => ({ ...prev, loading: true }));
  };

  return {
    ...state,
    refetch
  };
};
