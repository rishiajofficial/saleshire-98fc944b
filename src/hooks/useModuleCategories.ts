
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ModuleCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export const useModuleCategories = () => {
  const queryClient = useQueryClient();

  const {
    data: categories,
    isLoading,
    error
  } = useQuery({
    queryKey: ['moduleCategories'],
    queryFn: async (): Promise<ModuleCategory[]> => {
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
      queryClient.invalidateQueries({ queryKey: ['moduleCategories'] });
      toast.success("Category deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete category: ${error.message}`);
    }
  });

  return {
    categories: categories || [],
    isLoading,
    error,
    deleteCategory: deleteCategory.mutate
  };
};
