
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CompanyRegistration from '@/components/company/CompanyRegistration';

const RegisterCompany = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Register Your Company</h1>
        <CompanyRegistration />
      </div>
    </MainLayout>
  );
};

export default RegisterCompany;
