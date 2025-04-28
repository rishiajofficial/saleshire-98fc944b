
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useQuizResults = (moduleId: string | undefined, moduleName?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userQuizResult', moduleId, user?.id, moduleName],
    queryFn: async () => {
      if (!user || !moduleId) return null;
      
      try {
        let query = supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
          .eq('passed', true);
          
        if (moduleName) {
          query = query.or(`module.eq.${moduleId},module.eq.${moduleName}`);
        } else {
          query = query.eq('module', moduleId);
        }
        
        const { data, error } = await query.maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching quiz results:", error);
        }
        
        return data;
      } catch (error) {
        console.error("Error in quiz results query:", error);
        return null;
      }
    },
    enabled: !!moduleId && !!user
  });
};
