
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
          assessment_results
        };
      }) || [];
      
      // Filter out archived candidates
      const filteredData = formattedData.filter(app => 
        app.candidate_status !== 'archived' && 
        app.candidate_status !== 'rejected'
      );
      
      return filteredData as Application[];
    },
    enabled: !!userId
  });
};
