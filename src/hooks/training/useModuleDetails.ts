
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useModuleDetails = (moduleId: string | undefined) => {
  return useQuery({
    queryKey: ['moduleDetails', moduleId],
    queryFn: async () => {
      if (!moduleId) return null;
      console.log("Fetching module details for:", moduleId);
      
      try {
        const { data, error } = await supabase
          .from('module_categories')
          .select('*')
          .eq('id', moduleId)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching module details:", error);
          throw error;
        }
        
        console.log("Fetched module details:", data);
        
        if (!data) {
          console.error(`Module with ID ${moduleId} not found`);
        }
        
        return data;
      } catch (error) {
        console.error("Error in moduleDetails query:", error);
        return null;
      }
    },
    enabled: !!moduleId
  });
};
