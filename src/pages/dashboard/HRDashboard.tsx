
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { NotificationsCard } from '@/components/dashboard/NotificationsCard';
import { JobsList } from '@/components/jobs/JobsList';
import ApplicationsList from '@/components/dashboard/ApplicationsList';
import { TrainingCard } from '@/components/dashboard/TrainingCard';
import { useJobApplications } from '@/hooks/useJobApplications';
import { UserRole } from '@/types';
import JobListings from '@/components/dashboard/JobListings';
import { getUserActivityLogs } from '@/services/userService';
import { useQuery } from '@tanstack/react-query';
import { Tables } from '@/integrations/supabase/types';
import { TrainingModuleProgress } from '@/types/training';

const HRDashboard = () => {
  const { profile } = useAuth();
  const { data: applications, isLoading: applicationsLoading } = useJobApplications();
  
  // Fetch activity logs
  const { data: activityLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['activityLogs', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      return await getUserActivityLogs(profile.id, 5);
    },
    enabled: !!profile?.id,
  });

  if (!profile) {
    return <div>Loading...</div>;
  }

  // Mock data for demonstration purposes
  const stats = {
    totalCandidates: 12,
    pendingReviews: 48,
    interviewsScheduled: 8,
    nextInterviewDate: '2023-06-15T10:00:00Z'
  };

  // Format notifications for NotificationsCard from activity logs
  const formattedNotifications = activityLogs || [];

  // Mock training data for the TrainingCard with all required properties
  const mockTrainingModules: TrainingModuleProgress[] = [
    { 
      id: '1', 
      title: 'Onboarding', 
      progress: 75, 
      totalVideos: 4, 
      watchedVideos: 3, 
      quizIds: ['quiz1'], 
      quizCompleted: false,
      module: 'onboarding',
      status: 'in_progress',
      locked: false,
      videos: []
    },
    { 
      id: '2', 
      title: 'Sales Training', 
      progress: 30, 
      totalVideos: 6, 
      watchedVideos: 2, 
      quizIds: ['quiz2'], 
      quizCompleted: false,
      module: 'sales',
      status: 'active',
      locked: false,
      videos: []
    },
  ];

  return (
    <DashboardLayout
      children={
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">HR Dashboard</h1>
            <p className="text-muted-foreground">Manage job listings and applications</p>
          </div>
          
          <DashboardStats 
            totalCandidates={stats.totalCandidates}
            pendingReviews={stats.pendingReviews}
            interviewsScheduled={stats.interviewsScheduled}
            nextInterviewDate={stats.nextInterviewDate}
            isLoading={false}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <NotificationsCard 
                heading="Recent Activity"
                notifications={formattedNotifications}
              />
            </div>
            <div>
              <TrainingCard 
                canAccessTraining={true}
                trainingModules={mockTrainingModules}
                isLoadingTraining={false}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Job Listings</h2>
            <JobListings />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            <ApplicationsList 
              applications={applications || []} 
              isLoading={applicationsLoading}
              role="hr"
            />
          </div>
        </div>
      }
      sideContent={<div></div>}
    />
  );
};

export default HRDashboard;
