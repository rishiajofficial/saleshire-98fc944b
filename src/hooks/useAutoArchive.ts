
// This file would be created to handle auto-archiving of old applications
// For now, we'll create a simplified version that doesn't reference the 
// non-existent application_status_history table

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
        
        // Record the archive action for each application
        // We'll log this action to console since we don't have the application_status_history table yet
        console.log(`Auto-archived ${applicationIds.length} applications older than ${daysThreshold} days`);
        
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
