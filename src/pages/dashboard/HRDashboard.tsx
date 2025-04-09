
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import CandidateList from "@/components/dashboard/CandidateList";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AssessmentList from "@/components/dashboard/AssessmentList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HRDashboard = () => {
  // Fetch statistics for the dashboard
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Count total candidates
      const { count: totalCandidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });
      
      if (candidatesError) throw candidatesError;
      
      // Count pending reviews (candidates in step 1 or 2)
      const { count: pendingReviews, error: pendingError } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .in('current_step', [1, 2]);
      
      if (pendingError) throw pendingError;
      
      // Count scheduled interviews
      const { count: interviewsScheduled, error: interviewsError } = await supabase
        .from('interviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled');
      
      if (interviewsError) throw interviewsError;
      
      // Get next interview date
      const { data: nextInterview, error: nextInterviewError } = await supabase
        .from('interviews')
        .select('scheduled_at')
        .eq('status', 'scheduled')
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single();
      
      // It's ok if there's no next interview
      const nextInterviewDate = nextInterview?.scheduled_at || null;
      
      return {
        totalCandidates: totalCandidates || 0,
        pendingReviews: pendingReviews || 0,
        interviewsScheduled: interviewsScheduled || 0,
        nextInterviewDate
      };
    }
  });
  
  // Fetch recent assessments
  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['recent-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          id,
          title,
          difficulty,
          updated_at,
          created_by
        `)
        .order('updated_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });
  
  // Fetch candidates that need review
  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates-for-review'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select(`
          id,
          status,
          current_step,
          updated_at,
          profiles(name, email),
          assessment_results(score)
        `)
        .in('current_step', [1, 2])  // Focus on candidates in early stages
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage candidates and review applications
          </p>
        </div>
        
        {/* Dashboard Stats */}
        <DashboardStats
          totalCandidates={statsData?.totalCandidates || 0}
          pendingReviews={statsData?.pendingReviews || 0}
          interviewsScheduled={statsData?.interviewsScheduled || 0}
          nextInterviewDate={statsData?.nextInterviewDate}
          isLoading={statsLoading}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Candidates awaiting review */}
          <div className="md:col-span-1">
            <CandidateList 
              candidates={candidates} 
              isLoading={candidatesLoading} 
            />
          </div>
          
          {/* Recent assessments */}
          <div className="md:col-span-1">
            <AssessmentList 
              assessments={assessments || []} 
              isLoading={assessmentsLoading}
            />
          </div>
        </div>
        
        {/* HR Quick Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common HR tasks and activities</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/40 p-6 rounded-xl text-center hover:bg-muted/60 transition-colors cursor-pointer">
              <h3 className="font-medium mb-2">Schedule Interviews</h3>
              <p className="text-sm text-muted-foreground">Manage upcoming candidate interviews</p>
            </div>
            <div className="bg-muted/40 p-6 rounded-xl text-center hover:bg-muted/60 transition-colors cursor-pointer">
              <h3 className="font-medium mb-2">Review Applications</h3>
              <p className="text-sm text-muted-foreground">Check new candidate applications</p>
            </div>
            <div className="bg-muted/40 p-6 rounded-xl text-center hover:bg-muted/60 transition-colors cursor-pointer">
              <h3 className="font-medium mb-2">Training Progress</h3>
              <p className="text-sm text-muted-foreground">Monitor candidate training completions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default HRDashboard;
