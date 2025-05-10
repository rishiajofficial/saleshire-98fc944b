
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePendingCandidates(userRole?: string) {
  return useQuery({
    queryKey: ["pendingCandidates", userRole],
    queryFn: async () => {
      // First, get all candidate IDs that have job applications
      const { data: applicationData, error: appError } = await supabase
        .from("job_applications")
        .select("candidate_id")
        .order("created_at", { ascending: false });

      if (appError) {
        console.error("Error fetching job applications:", appError);
        throw new Error(appError.message);
      }

      // Extract candidate IDs that have job applications
      const candidateIdsWithApplications = applicationData.map(app => app.candidate_id);

      // Get candidates who either:
      // 1. Have status "profile_created", OR
      // 2. Don't have any job applications
      const { data: candidates, error } = await supabase
        .from("candidates")
        .select(`
          id,
          created_at,
          status,
          region,
          profile:id (
            name, 
            email
          )
        `)
        .or(
          `status.eq.profile_created${candidateIdsWithApplications.length > 0 ? 
            `,id.not.in.(${candidateIdsWithApplications.join(',')})` : 
            ''}`
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending candidates:", error);
        throw new Error(error.message);
      }

      return candidates || [];
    },
    enabled: !!userRole && userRole !== "candidate",
  });
}
