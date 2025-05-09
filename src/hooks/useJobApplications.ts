
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/components/dashboard/ApplicationsList";

export const useJobApplications = (
  userId?: string, 
  role?: string, 
  filters?: {
    status?: string;
    jobId?: string;
    searchTerm?: string;
    dateRange?: string;
    startDate?: Date;
    endDate?: Date;
  }
) => {
  return useQuery({
    queryKey: ['job-applications', userId, role, filters],
    queryFn: async () => {
      let query = supabase
        .from('job_applications')
        .select(`
          *,
          jobs (
            id,
            title,
            description,
            department,
            location,
            employment_type,
            salary_range
          ),
          candidates:candidate_id (
            id,
            profile:profiles!candidates_id_fkey (
              name,
              email
            ),
            status,
            phone,
            location
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters if provided
      if (filters) {
        // Filter by status if provided
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        
        // Filter by jobId if provided
        if (filters.jobId) {
          query = query.eq('job_id', filters.jobId);
        }
        
        // Filter by date range
        if (filters.dateRange && filters.dateRange !== 'all') {
          const now = new Date();
          let startDate;
          
          switch (filters.dateRange) {
            case 'today':
              startDate = new Date(now.setHours(0, 0, 0, 0));
              break;
            case 'week':
              startDate = new Date(now.setDate(now.getDate() - 7));
              break;
            case 'month':
              startDate = new Date(now.setMonth(now.getMonth() - 1));
              break;
            default:
              startDate = null;
          }
          
          if (startDate) {
            query = query.gte('created_at', startDate.toISOString());
          }
        }
        
        // Filter by custom date range
        if (filters.startDate && filters.endDate) {
          query = query
            .gte('created_at', filters.startDate.toISOString())
            .lte('created_at', filters.endDate.toISOString());
        }
      }

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
          job_department: app.jobs?.department,
          job_location: app.jobs?.location,
          job_employment_type: app.jobs?.employment_type,
          job_salary_range: app.jobs?.salary_range,
          candidate_id: app.candidate_id,
          candidate_name: app.candidates?.profile?.name,
          candidate_email: app.candidates?.profile?.email,
          candidate_phone: app.candidates?.phone,
          candidate_location: app.candidates?.location,
          status: app.status,
          candidate_status: app.candidates?.status,
          created_at: app.created_at,
          updated_at: app.updated_at,
          assessment_results: [],  // Mock empty array for now
          tags: []  // Mock empty array for now
        };
      }) || [];
      
      // Apply search term filter client-side if provided
      let filteredData = formattedData;
      if (filters?.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredData = formattedData.filter(app => 
          (app.candidate_name && app.candidate_name.toLowerCase().includes(term)) || 
          (app.candidate_email && app.candidate_email.toLowerCase().includes(term)) ||
          (app.job_title && app.job_title.toLowerCase().includes(term))
        );
      }
      
      // Filter out archived candidates and rejected applications unless specifically requested
      if (!filters?.status || filters.status !== 'rejected') {
        filteredData = filteredData.filter(app => 
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
    
    // Log the status change in activity_logs
    if (userId) {
      const { error: logError } = await supabase
        .from('activity_logs')
        .insert({
          entity_type: 'job_application',
          entity_id: applicationId,
          user_id: userId,
          action: 'status_change',
          details: {
            new_status: newStatus,
            notes: notes || ''
          }
        });
        
      if (logError) throw logError;
    }
    
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
    
    // Log the status changes in activity_logs
    if (userId) {
      const activityLogs = applicationIds.map(appId => ({
        entity_type: 'job_application',
        entity_id: appId,
        user_id: userId,
        action: 'status_change',
        details: {
          new_status: newStatus,
          notes: notes || '',
          bulk_update: true
        }
      }));
      
      const { error: logError } = await supabase
        .from('activity_logs')
        .insert(activityLogs);
        
      if (logError) throw logError;
    }
    
    return { success: true, count: applicationIds.length };
  } catch (error: any) {
    console.error('Error performing bulk update:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
