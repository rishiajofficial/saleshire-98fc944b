
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CompanyManagement from '@/components/company/CompanyManagement';

const CompanySettings = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Company Settings</h1>
        <CompanyManagement />
      </div>
    </MainLayout>
  );
};

export default CompanySettings;
