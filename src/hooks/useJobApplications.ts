
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/components/dashboard/ApplicationsList";

export const useJobApplications = (userId?: string, role?: string, includeArchived: boolean = false) => {
  return useQuery({
    queryKey: ['job-applications', userId, role, includeArchived],
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
            status
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
      
      // Format data for easier consumption
      const formattedData = data?.map(app => {
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
          assessment_results: [],  // Mock empty array for now
          tags: []  // Mock empty array for now
        };
      }) || [];
      
      // Filter applications based on includeArchived flag
      let filteredData;
      if (includeArchived) {
        // Show only archived and rejected applications
        filteredData = formattedData.filter(app => 
          app.status === 'archived' || 
          app.status === 'rejected' ||
          app.candidate_status === 'archived'
        );
      } else {
        // Filter out archived candidates and rejected applications
        filteredData = formattedData.filter(app => 
          app.candidate_status !== 'archived' && 
          app.status !== 'archived' &&
          app.status !== 'rejected'
        );
      }
      
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
    // Update application status
    const { error: statusError } = await supabase
      .from('job_applications')
      .update({ status: newStatus })
      .eq('id', applicationId);
      
    if (statusError) throw statusError;
    
    // We're not recording history yet as we need to create the table first
    // Just return success
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
    
    // We're not recording history yet as we need to create the table first
    // Just return success
    return { success: true, count: applicationIds.length };
  } catch (error: any) {
    console.error('Error performing bulk update:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
