
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import JobListings from "@/components/dashboard/JobListings";
import ApplicationsList from "@/components/dashboard/ApplicationsList";
import PendingCandidatesList from "@/components/dashboard/PendingCandidatesList";
import { TooltipProvider } from "@/components/ui/tooltip";
import InterviewList from "@/components/dashboard/InterviewList";
import { useAuth } from "@/contexts/auth";
import { useJobApplications } from "@/hooks/useJobApplications";
import { usePendingCandidates } from "@/hooks/usePendingCandidates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarInset
} from "@/components/ui/sidebar";
import { getNavItems } from "@/components/layout/navigation/nav-items";
import { useLocation } from "react-router-dom";

const HRDashboard = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  
  const { 
    data: applications, 
    isLoading: isLoadingApplications 
  } = useJobApplications(user?.id, profile?.role);

  const {
    data: pendingCandidates,
    isLoading: isLoadingPendingCandidates
  } = usePendingCandidates(profile?.role);

  const navItems = getNavItems(profile?.role);
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <span className="font-bold text-lg">WorkForce</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => {
                if (!item.role.includes(profile?.role || 'candidate')) return null;
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild
                      isActive={location.pathname === item.href}
                      tooltip={item.label}
                    >
                      <a href={item.href}>
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="px-3 py-2">
              <div className="text-xs text-muted-foreground">
                {profile?.name || user?.email}
              </div>
              <div className="text-xs font-semibold capitalize">{profile?.role}</div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="container mx-auto px-4 py-8 space-y-8">
            <DashboardHeader userName={profile?.name} userRole={profile?.role} />
            <DashboardStats />

            <Tabs defaultValue="applications" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="interviews">Interviews</TabsTrigger>
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
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default HRDashboard;
