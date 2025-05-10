
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/auth";
import { useJobApplications } from "@/hooks/useJobApplications";
import ApplicationsList from "@/components/dashboard/ApplicationsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Applications = () => {
  const { user, profile } = useAuth();
  
  const { 
    data: applications, 
    isLoading: isLoadingApplications 
  } = useJobApplications(user?.id, profile?.role);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Job Applications</h1>
            <p className="text-muted-foreground">
              View and manage all job applications in the system.
            </p>
          </div>
        </div>

        <ApplicationsList 
          applications={applications || []} 
          isLoading={isLoadingApplications}
          role={profile?.role || 'hr'}
          userId={user?.id}
        />
      </div>
    </MainLayout>
  );
};

export default Applications;
