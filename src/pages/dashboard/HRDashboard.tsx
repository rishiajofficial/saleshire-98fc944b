
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { JobsList } from '@/components/jobs/JobsList';
import ApplicationsList from '@/components/dashboard/ApplicationsList';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TrainingCard } from '@/components/dashboard/TrainingCard';
import { NotificationsCard } from '@/components/dashboard/NotificationsCard';

const HRDashboard = () => {
  const dashboardStats = [
    { value: 12, label: "Open Positions", change: 2 },
    { value: 45, label: "Active Applications", change: -5 },
    { value: 8, label: "Interviews This Week", change: 3 },
    { value: 24, label: "Candidates in Pipeline", change: 0 }
  ];

  return (
    <MainLayout>
      <DashboardHeader 
        title="HR Dashboard" 
        description="Manage job postings and candidates" 
      />
      
      <DashboardStats stats={dashboardStats} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <TrainingCard 
          canAccessTraining={true}
          trainingModules={[]}
          isLoadingTraining={false}
        />
        <NotificationsCard 
          notifications={[
            { id: '1', title: 'New application received', date: new Date(), read: false },
            { id: '2', title: 'Interview scheduled', date: new Date(), read: true },
            { id: '3', title: 'Assessment completed', date: new Date(), read: false }
          ]} 
        />
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium text-lg mb-4">Quick Tasks</h3>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
              <span>Review new applications</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
              <span>Schedule interviews</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-yellow-500 rounded-full"></span>
              <span>Update job descriptions</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-medium mb-4">Active Job Listings</h2>
        <JobsList />
      </div>
      
      <div>
        <h2 className="text-xl font-medium mb-4">Recent Applications</h2>
        <ApplicationsList limit={5} />
      </div>
    </MainLayout>
  );
};

export default HRDashboard;
