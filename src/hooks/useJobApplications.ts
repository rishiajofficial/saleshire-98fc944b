
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
            )
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
      const formattedData = data?.map(app => ({
        id: app.id,
        job_id: app.job_id,
        job_title: app.jobs?.title,
        candidate_id: app.candidate_id,
        candidate_name: app.candidates?.profile?.name,
        candidate_email: app.candidates?.profile?.email,
        status: app.status,
        created_at: app.created_at,
        updated_at: app.updated_at,
        assessment_results: app.candidates?.assessment_results || []
      })) || [];
      
      return formattedData;
    },
    enabled: !!userId
  });
};
