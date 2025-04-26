import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTrainingProgress } from "@/hooks/useTrainingProgress";
import ErrorMessage from "@/components/ui/error-message";
import type { RealtimeChannel } from '@supabase/supabase-js';
import { StatusCard } from "@/components/dashboard/StatusCard";
import { NotificationsCard } from "@/components/dashboard/NotificationsCard";
import { HiringJourneyCard } from "@/components/dashboard/HiringJourneyCard";
import { TrainingCard } from "@/components/dashboard/TrainingCard";
import { ApplicationPrompt } from "@/components/dashboard/ApplicationPrompt";

type CandidateProfile = Tables<'candidates'>;
type AssessmentResult = Tables<'assessment_results'> & { profiles?: { name?: string | null } | null };
type ActivityLog = Tables<'activity_logs'>;

interface CandidateDashboardState {
  loading: boolean;
  error: string | null;
  candidateData: CandidateProfile | null;
  assessmentResults: AssessmentResult[];
  notifications: ActivityLog[];
  applicationSubmitted: boolean;
  currentStep: number;
}

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  
  const [dashboardState, setDashboardState] = useState<Omit<CandidateDashboardState, 'trainingModules'>>({
    loading: true,
    error: null,
    candidateData: null,
    assessmentResults: [],
    notifications: [],
    applicationSubmitted: false,
    currentStep: 0,
  });

  const { 
    trainingModules, 
    isLoading: isLoadingTraining, 
    error: trainingError, 
    refetch: refetchTraining 
  } = useTrainingProgress();

  const isLoading = dashboardState.loading || isLoadingTraining;
  const error = trainingError || dashboardState.error;

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const fetchOtherDashboardData = async () => {
      if (!user || !profile) {
        setDashboardState(prev => ({ ...prev, loading: false, error: "User not logged in" }));
        return;
      }

      if (dashboardState.candidateData === null) { 
         setDashboardState(prev => ({ ...prev, loading: true, error: null }));
      }

      try {
        console.log("Dashboard: Fetching initial non-training data for user:", user.id);

        const [candidateResult, resultsResult, notificationResult] = await Promise.all([
          supabase
            .from('candidates')
            .select('*')
            .eq('id', user.id)
            .single(),
          supabase
            .from('assessment_results')
            .select('*')
            .eq('candidate_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', user.id)
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
        
        const currentStep = fetchedCandidateData?.current_step ?? dashboardState.currentStep ?? (applicationSubmitted ? 1 : 0);
        
        console.log("Dashboard: Setting non-training state from initial fetch or update");
        setDashboardState(prev => ({
          ...prev,
          loading: false,
          error: null,
          candidateData: fetchedCandidateData ?? prev.candidateData,
          assessmentResults: assessmentResults,
          notifications: notifications,
          applicationSubmitted,
          currentStep,
        }));
        
        const currentStatus = fetchedCandidateData?.status?.toLowerCase();
        if (!applicationSubmitted && (currentStatus === 'applied' || currentStatus === 'screening')) {
      setTimeout(() => {
        toast.info(
          "Please complete your application to begin the hiring process",
          {
            action: {
              label: "Complete Now",
              onClick: () => navigate("/application"),
            },
            duration: 8000,
          }
        );
      }, 1000);
    }

      } catch (error: any) {
        console.error("Error fetching non-training dashboard data:", error);
        setDashboardState(prev => ({ ...prev, loading: false, error: error.message || "Failed to load dashboard data." }));
      } finally {
        setDashboardState(prev => ({ ...prev, loading: false }));
      }
    };

    if (!dashboardState.candidateData) {
      fetchOtherDashboardData();
    }

    if (user) {
       console.log("Dashboard: Setting up realtime subscription for candidate:", user.id);
      channel = supabase
        .channel(`candidate_updates_${user.id}`)
        .on<CandidateProfile>(
          'postgres_changes',
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'candidates', 
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            console.log('Dashboard: Realtime candidate update received:', payload.new);
            const updatedCandidateData = payload.new as CandidateProfile;
            const applicationSubmitted = 
                !!updatedCandidateData?.resume && 
                !!updatedCandidateData?.about_me_video && 
                !!updatedCandidateData?.sales_pitch_video;
            const currentStep = updatedCandidateData?.current_step ?? (applicationSubmitted ? 1 : 0);
            
            setDashboardState(prev => ({
              ...prev,
              candidateData: updatedCandidateData,
              applicationSubmitted,
              currentStep,
              loading: false,
              error: null
            }));
            toast.info("Your application status has been updated!");
            refetchTraining(); 
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('Dashboard: Realtime channel subscribed successfully!');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Dashboard: Realtime channel error:', err);
            toast.error('Connection issue: Dashboard might not update instantly.');
          }
        });
    }

    return () => {
      if (channel) {
        console.log("Dashboard: Unsubscribing from realtime channel.");
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, [user?.id]);

  const showApplicationPrompt = 
    !dashboardState.applicationSubmitted && 
    (dashboardState.candidateData?.status?.toLowerCase() === 'applied' || 
     dashboardState.candidateData?.status?.toLowerCase() === 'screening');

  const canAccessTraining = dashboardState.candidateData?.status === 'hr_approved' || 
                           dashboardState.candidateData?.status === 'training' ||
                           dashboardState.currentStep >= 3;

  if (isLoading) {
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
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Candidate Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {profile?.name || 'Candidate'}
            </p>
          </div>

          {showApplicationPrompt && <ApplicationPrompt />}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-6">
              <HiringJourneyCard 
                currentStep={dashboardState.currentStep}
                applicationSubmitted={dashboardState.applicationSubmitted}
              />

              <TrainingCard 
                canAccessTraining={canAccessTraining}
                trainingModules={trainingModules}
                isLoadingTraining={isLoadingTraining}
              />
            </div>

            <div className="md:col-span-4 space-y-6">
              <StatusCard 
                currentStep={dashboardState.currentStep}
                candidateStatus={dashboardState.candidateData?.status}
              />

              <NotificationsCard 
                notifications={dashboardState.notifications}
              />
            </div>
          </div>
        </div>
      </TooltipProvider>
    </MainLayout>
  );
};

export default CandidateDashboard;
