
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TrainingModule {
  id: string;
  name: string;
}

export const useTrainingModules = () => {
  const [modules, setModules] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrainingModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("training_modules")
        .select("id, title")
        .order("title");

      if (error) throw error;
      
      const formattedModules = data ? data.map(module => ({
        id: module.id,
        name: module.title || 'Untitled Module'
      })) : [];
      
      setModules(formattedModules);
    } catch (error: any) {
      toast.error(`Failed to fetch training modules: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingModules();
  }, []);

  return {
    modules,
    loading,
    fetchTrainingModules
  };
};
