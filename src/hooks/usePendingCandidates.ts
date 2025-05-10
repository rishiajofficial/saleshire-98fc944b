
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePendingCandidates(userRole?: string) {
  return useQuery({
    queryKey: ["pendingCandidates", userRole],
    queryFn: async () => {
      // Get candidates who have profiles but no job applications
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
        .not("id", "in", (subquery) => {
          return subquery.from("job_applications").select("candidate_id");
        })
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
