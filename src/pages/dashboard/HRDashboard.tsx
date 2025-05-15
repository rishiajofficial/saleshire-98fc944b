
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ApplicationsList } from "@/components/dashboard/ApplicationsList";
import { TrainingCard } from "@/components/dashboard/TrainingCard";
import { NotificationsCard } from "@/components/dashboard/NotificationsCard";

const HRDashboard = () => {
  return (
    <MainLayout title="HR Dashboard">
      <DashboardHeader title="HR Dashboard" description="Manage job postings and applicants" />
      <div className="grid gap-6 mt-8">
        <DashboardStats />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ApplicationsList />
          </div>
          <div className="space-y-6">
            <TrainingCard />
            <NotificationsCard />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HRDashboard;
