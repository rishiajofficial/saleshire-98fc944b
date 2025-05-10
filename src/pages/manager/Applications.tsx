
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/auth";
import { useJobApplications } from "@/hooks/useJobApplications";
import ApplicationsList from "@/components/dashboard/ApplicationsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Applications = () => {
  const { user, profile } = useAuth();
  const [showArchived, setShowArchived] = useState<boolean>(false);
  
  const { 
    data: applications, 
    isLoading: isLoadingApplications 
  } = useJobApplications(user?.id, profile?.role, showArchived);

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

        <Tabs defaultValue="active" onValueChange={(value) => setShowArchived(value === "archived")}>
          <TabsList>
            <TabsTrigger value="active">Active Applications</TabsTrigger>
            <TabsTrigger value="archived">Archived & Rejected</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4">
            <ApplicationsList 
              applications={applications || []} 
              isLoading={isLoadingApplications}
              role={profile?.role || 'hr'}
              userId={user?.id}
            />
          </TabsContent>
          <TabsContent value="archived" className="mt-4">
            <ApplicationsList 
              applications={applications || []} 
              isLoading={isLoadingApplications}
              role={profile?.role || 'hr'}
              userId={user?.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Applications;
