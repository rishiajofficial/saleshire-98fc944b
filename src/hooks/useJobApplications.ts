
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/components/dashboard/ApplicationsList";

export const useJobApplications = (userId?: string, role?: string) => {
  return useQuery({
    queryKey: ['job-applications', userId, role],
    queryFn: async () => {
      let query = supabase
        .from('job_applications')
        .select(`
          *,
          jobs (
            id,
            title,
            description
          ),
          candidates:candidate_id (
            id,
            profile:profiles!candidates_id_fkey (
              name,
              email
            ),
            assessment_results (
              id,
              score,
              completed
            ),
            status,
            tags
          )
        `)
        .order('created_at', { ascending: false });

      // If user is a manager, only show applications for their jobs
      if (role === 'manager' && userId) {
        query = query.eq('jobs.created_by', userId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Error fetching job applications: ${error.message}`);
      }
      
      // Format data for easier consumption and ensure assessment_results is always an array
      const formattedData = data?.map(app => {
        // Handle potential error case for assessment_results
        const assessment_results = app.candidates?.assessment_results && 
          Array.isArray(app.candidates.assessment_results) 
            ? app.candidates.assessment_results 
            : [];
          
        return {
          id: app.id,
          job_id: app.job_id,
          job_title: app.jobs?.title,
          candidate_id: app.candidate_id,
          candidate_name: app.candidates?.profile?.name,
          candidate_email: app.candidates?.profile?.email,
          status: app.status,
          candidate_status: app.candidates?.status,
          created_at: app.created_at,
          updated_at: app.updated_at,
          assessment_results,
          tags: app.candidates?.tags || []
        };
      }) || [];
      
      // Filter out archived candidates and rejected applications
      const filteredData = formattedData.filter(app => 
        app.candidate_status !== 'archived' && 
        app.candidate_status !== 'rejected'
      );
      
      return filteredData as Application[];
    },
    enabled: !!userId,
    refetchInterval: 30000 // Refresh every 30 seconds to catch status changes
  });
};

// Function to update application status with history tracking
export const updateApplicationStatus = async (
  applicationId: string,
  newStatus: string,
  notes?: string,
  userId?: string
) => {
  try {
    // Start a transaction
    const { error: statusError } = await supabase
      .from('job_applications')
      .update({ status: newStatus })
      .eq('id', applicationId);
      
    if (statusError) throw statusError;
    
    // Record the history
    const { error: historyError } = await supabase
      .from('application_status_history')
      .insert({
        application_id: applicationId,
        status: newStatus,
        updated_by: userId,
        notes: notes || `Status updated to ${newStatus}`
      });
      
    if (historyError) throw historyError;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating application status:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function for bulk status updates
export const bulkUpdateApplicationStatus = async (
  applicationIds: string[],
  newStatus: string,
  notes?: string,
  userId?: string
) => {
  try {
    // Update all applications
    const { error: updateError } = await supabase
      .from('job_applications')
      .update({ status: newStatus })
      .in('id', applicationIds);
      
    if (updateError) throw updateError;
    
    // Create history entries for all applications
    const historyEntries = applicationIds.map(id => ({
      application_id: id,
      status: newStatus,
      updated_by: userId,
      notes: notes || `Bulk update: status changed to ${newStatus}`
    }));
    
    const { error: historyError } = await supabase
      .from('application_status_history')
      .insert(historyEntries);
      
    if (historyError) throw historyError;
    
    return { success: true, count: applicationIds.length };
  } catch (error: any) {
    console.error('Error performing bulk update:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
