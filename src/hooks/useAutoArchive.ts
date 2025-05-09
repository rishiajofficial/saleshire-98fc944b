
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAutoArchive = (
  enabled: boolean = false,
  daysThreshold: number = 30
) => {
  const [isArchiving, setIsArchiving] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [archivedCount, setArchivedCount] = useState(0);
  
  const runArchive = async () => {
    if (!enabled || isArchiving) return;
    
    setIsArchiving(true);
    
    try {
      // Calculate the date threshold
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
      
      // Get applications older than the threshold that aren't already archived
      const { data: oldApplications, error: fetchError } = await supabase
        .from('job_applications')
        .select('id')
        .lt('created_at', thresholdDate.toISOString())
        .not('status', 'eq', 'archived')
        .not('status', 'eq', 'hired');
      
      if (fetchError) throw fetchError;
      
      if (oldApplications && oldApplications.length > 0) {
        const applicationIds = oldApplications.map(app => app.id);
        
        // Update the applications to archived status
        const { error: updateError } = await supabase
          .from('job_applications')
          .update({ status: 'archived' })
          .in('id', applicationIds);
        
        if (updateError) throw updateError;
        
        // Get the current user
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id || 'system';
        
        // Log to activity_logs instead of application_status_history
        for (const appId of applicationIds) {
          await supabase
            .from('activity_logs')
            .insert({
              entity_type: 'job_application',
              entity_id: appId,
              action: 'status_change',
              user_id: userId,
              details: {
                old_status: 'unknown',
                new_status: 'archived',
                notes: `Auto-archived after ${daysThreshold} days of inactivity`
              }
            });
        }
        
        setArchivedCount(prev => prev + applicationIds.length);
        
        // Show toast notification
        if (applicationIds.length > 0) {
          toast.info(`Auto-archived ${applicationIds.length} old applications`);
        }
      }
      
      setLastRun(new Date());
    } catch (error: any) {
      console.error('Error auto-archiving applications:', error);
      toast.error(`Auto-archive error: ${error.message}`);
    } finally {
      setIsArchiving(false);
    }
  };
  
  // Run on mount and then daily if enabled
  useEffect(() => {
    if (!enabled) return;
    
    // Run once on mount
    runArchive();
    
    // Set up daily check
    const interval = setInterval(runArchive, 24 * 60 * 60 * 1000); // Once per day
    
    return () => clearInterval(interval);
  }, [enabled, daysThreshold]);
  
  return {
    isArchiving,
    lastRun,
    archivedCount,
    runArchive
  };
};
