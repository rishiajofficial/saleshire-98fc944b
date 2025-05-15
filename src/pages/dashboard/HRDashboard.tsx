
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ApplicationsList from "@/components/dashboard/ApplicationsList";
import { TrainingCard } from "@/components/dashboard/TrainingCard";
import { NotificationsCard } from "@/components/dashboard/NotificationsCard";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";

const HRDashboard = () => {
  const { profile } = useAuth();
  const [trainingModules, setTrainingModules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingTraining, setIsLoadingTraining] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  // Fetch training modules
  useEffect(() => {
    async function fetchTrainingModules() {
      try {
        setIsLoadingTraining(true);
        const { data, error } = await supabase
          .from('training_modules')
          .select('*')
          .eq('archived', false);
        
        if (error) throw error;
        setTrainingModules(data || []);
      } catch (error) {
        console.error('Error fetching training modules:', error);
      } finally {
        setIsLoadingTraining(false);
      }
    }

    // Fetch notifications/activity logs
    async function fetchNotifications() {
      try {
        setIsLoadingNotifications(true);
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    }

    fetchTrainingModules();
    fetchNotifications();
  }, []);

  return (
    <MainLayout title="HR Dashboard">
      <DashboardHeader userName={profile?.name} userRole={profile?.role as UserRole} />
      <div className="grid gap-6 mt-8">
        <DashboardStats />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ApplicationsList 
              applications={[]} 
              isLoading={false}
              role={profile?.role || 'hr'}
            />
          </div>
          <div className="space-y-6">
            <TrainingCard 
              canAccessTraining={true} 
              trainingModules={trainingModules}
              isLoadingTraining={isLoadingTraining}
            />
            <NotificationsCard notifications={notifications} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HRDashboard;
