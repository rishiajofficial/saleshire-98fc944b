
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import CompanyManagement from '@/components/company/CompanyManagement';
import JobListings from '@/components/dashboard/JobListings';

const CompanyHub = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Company Hub</h1>
        
        <DashboardLayout
          children={<JobListings />}
          sideContent={<CompanyManagement />}
        />
      </div>
    </MainLayout>
  );
};

export default CompanyHub;
