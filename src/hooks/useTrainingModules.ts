
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrainingModuleProgress } from "@/types/training";

export const useTrainingModules = () => {
  const [modules, setModules] = useState<TrainingModuleProgress[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrainingModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("training_modules")
        .select("id, title, description, module")
        .eq("archived", false)
        .order("title");

      if (error) throw error;
      
      const formattedModules: TrainingModuleProgress[] = data ? data.map(module => ({
        id: module.id,
        title: module.title || 'Untitled Module',
        description: module.description,
        module: module.module || 'general',
        progress: 0,
        status: 'active' as const,
        locked: false,
        videos: [],
        quizIds: [],
        totalVideos: 0,
        watchedVideos: 0,
        quizCompleted: false
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
