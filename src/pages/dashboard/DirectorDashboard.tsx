
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { AssessmentList } from "@/components/dashboard/AssessmentList";
import { JobListings } from "@/components/dashboard/JobListings";
import ApplicationsList from "@/components/dashboard/ApplicationsList";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useJobApplications } from "@/hooks/useJobApplications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DirectorDashboard = () => {
  const { user, profile } = useAuth();
  
  const { 
    data: applications, 
    isLoading: isLoadingApplications 
  } = useJobApplications(user?.id, profile?.role);
  
  return (
    <MainLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-8 space-y-8">
          <DashboardHeader userName={profile?.name} />
          <DashboardStats />

          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
            </TabsList>
            <TabsContent value="applications">
              <ApplicationsList 
                applications={applications || []} 
                isLoading={isLoadingApplications}
                role={profile?.role || 'director'}
              />
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
