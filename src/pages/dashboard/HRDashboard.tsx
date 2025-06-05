
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, ClipboardList, UserCheck, TrendingUp, Calendar, BookOpen, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const HRDashboard = () => {
  const { user } = useAuth();

  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['hr-dashboard-stats'],
    queryFn: async () => {
      const [candidatesRes, jobsRes, applicationsRes, assessmentsRes] = await Promise.all([
        supabase.from('candidates').select('id, status').not('status', 'eq', 'archived'),
        supabase.from('jobs').select('id, status').eq('archived', false),
        supabase.from('job_applications').select('id, status, created_at'),
        supabase.from('assessments').select('id').eq('archived', false)
      ]);

      const totalCandidates = candidatesRes.data?.length || 0;
      const activeCandidates = candidatesRes.data?.filter(c => !['rejected', 'hired'].includes(c.status))?.length || 0;
      const totalJobs = jobsRes.data?.length || 0;
      const activeJobs = jobsRes.data?.filter(j => j.status === 'active')?.length || 0;
      const totalApplications = applicationsRes.data?.length || 0;
      const recentApplications = applicationsRes.data?.filter(a => {
        const created = new Date(a.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created >= weekAgo;
      })?.length || 0;
      const totalAssessments = assessmentsRes.data?.length || 0;

      return {
        totalCandidates,
        activeCandidates,
        totalJobs,
        activeJobs,
        totalApplications,
        recentApplications,
        totalAssessments
      };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">HR Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage hiring processes, candidates, and assessments
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCandidates || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeCandidates || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeJobs || 0}</div>
              <p className="text-xs text-muted-foreground">
                of {stats?.totalJobs || 0} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.recentApplications || 0} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assessments</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAssessments || 0}</div>
              <p className="text-xs text-muted-foreground">
                Available assessments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Candidate Management
              </CardTitle>
              <CardDescription>
                View and manage all candidates in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/candidates">View All Candidates</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/applications">Review Applications</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Management
              </CardTitle>
              <CardDescription>
                Create and manage job openings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/jobs">Manage Jobs</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Assessment Center
              </CardTitle>
              <CardDescription>
                Manage assessments and view results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/assessments">View Assessments</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/assessments/create">Create Assessment</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Training Management
              </CardTitle>
              <CardDescription>
                Manage training modules and videos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/training-management">Manage Training</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics & Reports
              </CardTitle>
              <CardDescription>
                View hiring analytics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/assessments">Assessment Results</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/candidates">Candidate Analytics</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Interview Scheduling
              </CardTitle>
              <CardDescription>
                Schedule and manage candidate interviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/candidates">Schedule Interviews</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/applications">Interview Pipeline</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default HRDashboard;
