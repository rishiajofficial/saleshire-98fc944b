
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainingModulesList } from './useTrainingModulesList';

export interface TrainingProgressState {
  product: number;
  sales: number;
  relationship: number;
  overall: number;
  categories: Record<string, number>;
}

export const useTrainingProgress = () => {
  const { user } = useAuth();
  const { trainingModules, isLoading, error, refetch } = useTrainingModulesList();
  const [progress, setProgress] = useState<TrainingProgressState>({
    product: 0,
    sales: 0,
    relationship: 0,
    overall: 0,
    categories: {}
  });

  React.useEffect(() => {
    if (trainingModules.length > 0) {
      const categoriesProgress: Record<string, number> = {};
      
      trainingModules.forEach(module => {
        categoriesProgress[module.module] = module.progress;
      });
      
      const totalModules = trainingModules.length;
      const overallProgress = totalModules > 0 
        ? Math.round(trainingModules.reduce((sum, mod) => sum + mod.progress, 0) / totalModules)
        : 0;

      setProgress({
        product: categoriesProgress['product'] || 0,
        sales: categoriesProgress['sales'] || 0,
        relationship: categoriesProgress['relationship'] || 0,
        overall: overallProgress,
        categories: categoriesProgress
      });
    }
  }, [trainingModules]);

  return {
    trainingModules,
    progress,
    isLoading,
    error,
    refetch
  };
};
