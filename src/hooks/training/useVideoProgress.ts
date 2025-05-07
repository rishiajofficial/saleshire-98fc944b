import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useVideoProgress = (moduleId: string | undefined, moduleName?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userVideoProgress', moduleId, user?.id, moduleName],
    queryFn: async () => {
      if (!user || !moduleId) return [];
      
      try {
        const { data, error } = await supabase
          .from('training_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', true);
        
        if (error) {
          console.error("Error fetching progress:", error);
          return [];
        }
        
        let relevantProgress = data || [];
        if (moduleName) {
          relevantProgress = relevantProgress.filter(
            item => item.module === moduleId || item.module === moduleName
          );
        }
        
        return relevantProgress;
      } catch (error) {
        console.error("Error in videoProgress query:", error);
        return [];
      }
    },
    enabled: !!moduleId && !!user
  });
};
