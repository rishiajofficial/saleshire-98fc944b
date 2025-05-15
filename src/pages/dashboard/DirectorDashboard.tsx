
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AssessmentList from "@/components/dashboard/AssessmentList";
import JobListings from "@/components/dashboard/JobListings";
import ApplicationsList from "@/components/dashboard/ApplicationsList";
import PendingCandidatesList from "@/components/dashboard/PendingCandidatesList";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth";
import { useJobApplications } from "@/hooks/useJobApplications";
import { usePendingCandidates } from "@/hooks/usePendingCandidates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DirectorDashboard = () => {
  const { user, profile } = useAuth();
  
  const { 
    data: applications, 
    isLoading: isLoadingApplications 
  } = useJobApplications(user?.id, profile?.role);
  
  const {
    data: pendingCandidates,
    isLoading: isLoadingPendingCandidates
  } = usePendingCandidates(profile?.role);
  
  // Director-specific stats
  const directorStats = [
    { value: 42, label: 'Total Positions', change: 7 },
    { value: 248, label: 'Total Candidates', change: 15 },
    { value: 76, label: 'Successful Hires', change: 12 },
    { value: 94, label: 'Department Score', change: 3 },
  ];
  
  return (
    <MainLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-8 space-y-8">
          <DashboardHeader userName={profile?.name} userRole={profile?.role} />
          <DashboardStats stats={directorStats} />

          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
            </TabsList>
            <TabsContent value="applications">
              <div className="space-y-8">
                <ApplicationsList 
                  applications={applications || []} 
                  isLoading={isLoadingApplications}
                  role={profile?.role || 'director'}
                />
                <PendingCandidatesList
                  candidates={pendingCandidates || []}
                  isLoading={isLoadingPendingCandidates}
                  role={profile?.role || 'director'}
                />
              </div>
            </TabsContent>
            <TabsContent value="jobs">
              <JobListings />
            </TabsContent>
            <TabsContent value="assessments">
              <AssessmentList />
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </MainLayout>
  );
};

export default DirectorDashboard;
