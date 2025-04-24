
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

// Update the interface to match the database schema
export interface TrainingCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
}

export const useModuleCategories = () => {
  const queryClient = useQueryClient();

  const {
    data: trainingCategories,
    isLoading,
    error
  } = useQuery({
    queryKey: ['trainingCategories'],
    queryFn: async (): Promise<TrainingCategory[]> => {
      const { data, error } = await supabase
        .from('module_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('module_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingCategories'] });
      toast.success("Category deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete category: ${error.message}`);
    }
  });

  return {
    trainingCategories: trainingCategories || [],
    isLoading,
    error,
    deleteCategory: deleteCategory.mutate
  };
};
