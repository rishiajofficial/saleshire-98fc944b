
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { NotificationsCard } from '@/components/dashboard/NotificationsCard';
import { JobsList } from '@/components/jobs/JobsList';
import { ApplicationsList } from '@/components/dashboard/ApplicationsList';
import { TrainingCard } from '@/components/dashboard/TrainingCard';
import { useJobApplications } from '@/hooks/useJobApplications';
import { UserRole } from '@/types';

const HRDashboard = () => {
  const { profile } = useAuth();
  const { data: applications, isLoading: applicationsLoading } = useJobApplications();

  if (!profile) {
    return <div>Loading...</div>;
  }

  // Mock data for demonstration purposes
  const stats = [
    { value: 12, label: 'Active Jobs', change: 2 },
    { value: 48, label: 'Pending Applications', change: -5 },
    { value: 8, label: 'Scheduled Interviews', change: 3 },
    { value: 92, label: 'Hiring Rate %', change: 5 },
  ];

  // Mock data for activity logs
  const activityLogs = [
    { id: '1', action: 'job_created', details: {}, created_at: '2023-06-10T10:00:00Z', entity_id: '1', entity_type: 'jobs', user_id: '123' },
    { id: '2', action: 'application_reviewed', details: {}, created_at: '2023-06-09T14:30:00Z', entity_id: '2', entity_type: 'applications', user_id: '123' },
    { id: '3', action: 'interview_scheduled', details: {}, created_at: '2023-06-08T09:15:00Z', entity_id: '3', entity_type: 'interviews', user_id: '123' },
  ];

  // Format the activity logs to include display text
  const formattedLogs = activityLogs.map(log => {
    let displayText = '';
    
    switch(log.action) {
      case 'job_created':
        displayText = 'New job posting has been created';
        break;
      case 'application_reviewed':
        displayText = 'Application has been reviewed';
        break;
      case 'interview_scheduled':
        displayText = 'Interview has been scheduled';
        break;
      default:
        displayText = 'Activity recorded';
    }
    
    return {
      ...log,
      displayText
    };
  });

  return (
    <DashboardLayout
      children={
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">HR Dashboard</h1>
            <p className="text-muted-foreground">Manage job listings and applications</p>
          </div>
          
          <DashboardStats stats={stats} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <NotificationsCard 
                title="Recent Activity"
                notifications={formattedLogs.map(log => ({
                  id: log.id,
                  title: log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  message: log.displayText,
                  time: new Date(log.created_at).toLocaleString(),
                }))}
              />
            </div>
            <div>
              <TrainingCard />
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Job Listings</h2>
            <JobsList />
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
