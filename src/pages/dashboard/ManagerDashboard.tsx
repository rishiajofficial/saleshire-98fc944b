
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { ApplicationsList } from "@/components/dashboard/ApplicationsList";
import RecentResultsList from "@/components/dashboard/RecentResultsList";
import { TooltipProvider } from "@/components/ui/tooltip";
import InterviewList from "@/components/dashboard/InterviewList";
import { useAuth } from "@/contexts/auth";
import { useJobApplications } from "@/hooks/useJobApplications";

const ManagerDashboard = () => {
  const { user, profile } = useAuth();
  
  const { 
    data: applications, 
    isLoading: isLoadingApplications 
  } = useJobApplications(user?.id, profile?.role);

  return (
    <MainLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-8 space-y-8">
          <DashboardHeader userName={profile?.name} userRole={profile?.role} />
          <DashboardStats />
          <ApplicationsList 
            applications={applications || []} 
            isLoading={isLoadingApplications}
            userRole={profile?.role || 'manager'}
            userId={user?.id}
          />
          <RecentResultsList />
          <InterviewList />
        </div>
      </TooltipProvider>
    </MainLayout>
  );
};

export default ManagerDashboard;
