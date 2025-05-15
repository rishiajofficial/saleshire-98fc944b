
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import JobListings from "@/components/dashboard/JobListings";
import ApplicationsList from "@/components/dashboard/ApplicationsList";
import RecentResultsList from "@/components/dashboard/RecentResultsList";
import PendingCandidatesList from "@/components/dashboard/PendingCandidatesList";
import { TooltipProvider } from "@/components/ui/tooltip";
import InterviewList from "@/components/dashboard/InterviewList";
import { useAuth } from "@/contexts/auth";
import { useJobApplications } from "@/hooks/useJobApplications";
import { usePendingCandidates } from "@/hooks/usePendingCandidates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/types";

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  
  const { 
    data: applications, 
    isLoading: isLoadingApplications 
  } = useJobApplications(user?.id, profile?.role);

  const {
    data: pendingCandidates,
    isLoading: isLoadingPendingCandidates
  } = usePendingCandidates(profile?.role);

  return (
    <MainLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-8 space-y-8">
          <DashboardHeader userName={profile?.name} userRole={profile?.role as UserRole} />
          <DashboardStats />

          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="interviews">Interviews</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
            </TabsList>
            <TabsContent value="applications">
              <div className="space-y-8">
                <ApplicationsList 
                  applications={applications || []} 
                  isLoading={isLoadingApplications}
                  role={profile?.role || 'hr'}
                />
                <PendingCandidatesList
                  candidates={pendingCandidates || []}
                  isLoading={isLoadingPendingCandidates}
                  role={profile?.role || 'hr'}
                />
              </div>
            </TabsContent>
            <TabsContent value="jobs">
              <JobListings />
            </TabsContent>
            <TabsContent value="interviews">
              <InterviewList />
            </TabsContent>
            <TabsContent value="results">
              <RecentResultsList />
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </MainLayout>
  );
};

export default AdminDashboard;
