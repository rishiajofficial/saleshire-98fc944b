
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import DashboardStats from "@/components/dashboard/DashboardStats";
import CandidateList from "@/components/dashboard/CandidateList";
import InterviewList from "@/components/dashboard/InterviewList";
import AssessmentList from "@/components/dashboard/AssessmentList";
import { Interview } from "@/types";

const ManagerDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending-reviews");

  // Fetch pending candidates that need review
  const { data: pendingCandidates, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ['pendingCandidates'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select(`
            id,
            status,
            current_step,
            updated_at,
            profiles:id(name, email),
            assessment_results(score, completed, completed_at)
          `)
          .in('status', ['applied', 'hr_review', 'hr_approved', 'training', 'final_interview'])
          .order('updated_at', { ascending: false });
        
        if (error) {
          toast({
            variant: "destructive",
            title: "Error fetching candidates",
            description: error.message,
          });
          throw error;
        }
        
        return data || [];
      } catch (err) {
        console.error("Error in pendingCandidates query:", err);
        return [];
      }
    }
  });

  // Fetch upcoming interviews
  const { data: upcomingInterviewsRaw, isLoading: isLoadingInterviews } = useQuery({
    queryKey: ['upcomingInterviews'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('interviews')
          .select(`
            id,
            scheduled_at,
            status,
            candidate_id
          `)
          .in('status', ['scheduled', 'confirmed'])
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(5);
        
        if (error) {
          toast({
            variant: "destructive",
            title: "Error fetching interviews",
            description: error.message,
          });
          throw error;
        }
        
        return data || [];
      } catch (err) {
        console.error("Error in upcomingInterviews query:", err);
        return [];
      }
    }
  });

  // Fetch candidate names for the interviews in a separate query
  const { data: candidateProfiles, isLoading: isLoadingProfiles } = useQuery({
    queryKey: ['candidateProfiles', upcomingInterviewsRaw],
    queryFn: async () => {
      if (!upcomingInterviewsRaw || upcomingInterviewsRaw.length === 0) return {};
      
      try {
        const candidateIds = upcomingInterviewsRaw.map(interview => interview.candidate_id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select(`id, name, email`)
          .in('id', candidateIds);
          
        if (error) {
          toast({
            variant: "destructive",
            title: "Error fetching candidate profiles",
            description: error.message,
          });
          throw error;
        }
        
        // Convert to a map for easy lookup
        return data.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, {id: string, name: string, email: string}>);
      } catch (err) {
        console.error("Error in candidateProfiles query:", err);
        return {};
      }
    },
    enabled: !!upcomingInterviewsRaw && upcomingInterviewsRaw.length > 0,
  });

  // Combine interview data with candidate names
  const upcomingInterviews: Interview[] = React.useMemo(() => {
    if (!upcomingInterviewsRaw || !candidateProfiles) return [];
    
    return upcomingInterviewsRaw.map(interview => ({
      id: interview.id,
      candidateId: interview.candidate_id,
      candidateName: candidateProfiles[interview.candidate_id]?.name || "Unknown",
      candidateEmail: candidateProfiles[interview.candidate_id]?.email || "Unknown",
      managerId: "", // This will be populated in a full implementation
      scheduledAt: interview.scheduled_at,
      status: interview.status as 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
    }));
  }, [upcomingInterviewsRaw, candidateProfiles]);

  // Fetch recent assessments
  const { data: recentAssessments, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ['recentAssessments'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('assessments')
          .select(`
            id,
            title,
            difficulty,
            created_at,
            updated_at
          `)
          .order('updated_at', { ascending: false })
          .limit(3);
        
        if (error) {
          toast({
            variant: "destructive",
            title: "Error fetching assessments",
            description: error.message,
          });
          throw error;
        }
        
        // Get the submissions count and average scores as separate queries
        const assessmentsWithStats = await Promise.all(data.map(async (assessment) => {
          const { data: resultsData, error: resultsError } = await supabase
            .from('assessment_results')
            .select('score')
            .eq('assessment_id', assessment.id);
          
          if (resultsError) {
            console.error("Error fetching assessment results:", resultsError);
            return {
              ...assessment,
              avgScore: 0,
              submissions: 0
            };
          }
          
          const scores = resultsData.map(r => r.score);
          const avgScore = scores.length > 0 
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
            : 0;
          
          return {
            ...assessment,
            avgScore,
            submissions: scores.length
          };
        }));
        
        return assessmentsWithStats || [];
      } catch (err) {
        console.error("Error in recentAssessments query:", err);
        return [];
      }
    }
  });

  // Calculate dashboard stats
  const dashboardStats = {
    totalCandidates: pendingCandidates?.length || 0,
    pendingReviews: pendingCandidates?.filter(c => 
      c.status === 'applied' || c.status === 'hr_review' || c.status === 'final_interview'
    ).length || 0,
    interviewsScheduled: upcomingInterviews?.length || 0,
  };

  // Get next interview date if any
  const nextInterviewDate = upcomingInterviews && upcomingInterviews.length > 0
    ? upcomingInterviews[0].scheduledAt
    : undefined;

  const isLoading = isLoadingCandidates || isLoadingInterviews || isLoadingProfiles;

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Focus on your most important tasks: reviewing candidates and upcoming interviews
          </p>
        </div>

        <DashboardStats
          totalCandidates={dashboardStats.totalCandidates}
          pendingReviews={dashboardStats.pendingReviews}
          interviewsScheduled={dashboardStats.interviewsScheduled}
          nextInterviewDate={nextInterviewDate}
          isLoading={isLoading}
        />

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending-reviews">Pending Reviews</TabsTrigger>
            <TabsTrigger value="upcoming-interviews">Upcoming Interviews</TabsTrigger>
            <TabsTrigger value="recent-assessments">Recent Assessments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending-reviews">
            <CandidateList 
              candidates={pendingCandidates || []} 
              isLoading={isLoadingCandidates} 
            />
          </TabsContent>
          
          <TabsContent value="upcoming-interviews">
            <InterviewList 
              interviews={upcomingInterviews || []} 
              isLoading={isLoading} 
            />
          </TabsContent>
          
          <TabsContent value="recent-assessments">
            <AssessmentList 
              assessments={recentAssessments || []} 
              isLoading={isLoadingAssessments} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ManagerDashboard;
