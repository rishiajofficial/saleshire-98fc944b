
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AssessmentList from "@/components/dashboard/AssessmentList";
import InterviewList from "@/components/dashboard/InterviewList";
import ApplicationsList from "@/components/dashboard/ApplicationsList";
import PendingCandidatesList from "@/components/dashboard/PendingCandidatesList";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth";
import { useJobApplications } from "@/hooks/useJobApplications";
import { usePendingCandidates } from "@/hooks/usePendingCandidates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ManagerDashboard = () => {
  const { user, profile } = useAuth();
  
  const { 
    data: applications, 
    isLoading: isLoadingApplications 
  } = useJobApplications(user?.id, profile?.role);
  
  const {
    data: pendingCandidates,
    isLoading: isLoadingPendingCandidates
  } = usePendingCandidates(profile?.role);
  
  // Manager-specific stats
  const managerStats = [
    { value: 18, label: 'Team Applications', change: 4 },
    { value: 12, label: 'Pending Reviews', change: -2 },
    { value: 6, label: 'Upcoming Interviews', change: 1 },
    { value: 84, label: 'Team Performance', change: 3 },
  ];
  
  return (
    <MainLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-8 space-y-8">
          <DashboardHeader userName={profile?.name} userRole={profile?.role} />
          <DashboardStats stats={managerStats} />
          
          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="interviews">Interviews</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
            </TabsList>
            <TabsContent value="applications">
              <div className="space-y-8">
                <ApplicationsList 
                  applications={applications || []} 
                  isLoading={isLoadingApplications}
                  role={profile?.role || 'manager'}
                />
                <PendingCandidatesList
                  candidates={pendingCandidates || []}
                  isLoading={isLoadingPendingCandidates}
                  role={profile?.role || 'manager'}
                />
              </div>
            </TabsContent>
            <TabsContent value="interviews">
              <InterviewList />
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

export default ManagerDashboard;
