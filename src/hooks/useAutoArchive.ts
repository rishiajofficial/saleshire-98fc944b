
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addDays, isBefore, parseISO } from "date-fns";
import { toast } from "sonner";

// Hook for managing auto-archiving of old applications
export const useAutoArchive = (userId?: string) => {
  const [isArchiving, setIsArchiving] = useState(false);

  // Function to archive applications older than the specified days with no activity
  const archiveOldApplications = async (daysThreshold: number = 90) => {
    if (!userId) return { success: false, error: "User not authenticated" };
    
    setIsArchiving(true);
    try {
      const now = new Date();
      const thresholdDate = addDays(now, -daysThreshold); // e.g., 90 days ago
      
      // First, get applications that need to be archived
      const { data: applications, error: fetchError } = await supabase
        .from('job_applications')
        .select('id, status, updated_at')
        .neq('status', 'archived')
        .neq('status', 'hired');
      
      if (fetchError) throw fetchError;
      
      // Filter applications that haven't been updated since the threshold date
      const applicationsToArchive = applications?.filter(app => {
        const updatedAt = parseISO(app.updated_at);
        return isBefore(updatedAt, thresholdDate);
      }) || [];
      
      if (applicationsToArchive.length === 0) {
        toast.info("No inactive applications found to archive.");
        return { success: true, archivedCount: 0 };
      }
      
      // Archive these applications
      const applicationIds = applicationsToArchive.map(app => app.id);
      
      const { error: updateError } = await supabase
        .from('job_applications')
        .update({ status: 'archived' })
        .in('id', applicationIds);
      
      if (updateError) throw updateError;
      
      // Add to status history
      const historyEntries = applicationIds.map(id => ({
        application_id: id,
        status: 'archived',
        updated_by: userId,
        notes: `Auto-archived due to inactivity (>${daysThreshold} days)`
      }));
      
      await supabase
        .from('application_status_history')
        .insert(historyEntries);
      
      toast.success(`Auto-archived ${applicationIds.length} inactive applications.`);
      return { success: true, archivedCount: applicationIds.length };
      
    } catch (error: any) {
      console.error('Error auto-archiving applications:', error);
      toast.error(`Failed to archive old applications: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsArchiving(false);
    }
  };

  return {
    archiveOldApplications,
    isArchiving
  };
};

export default useAutoArchive;
