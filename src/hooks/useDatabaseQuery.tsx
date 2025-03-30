
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

// Define valid table names as a literal union type
export type TableName = 'activity_logs' | 'assessment_results' | 'assessment_sections' | 
                        'assessments' | 'candidates' | 'interviews' | 'manager_regions' | 
                        'managers' | 'profiles' | 'questions' | 'sales_tasks' | 'shops' | 
                        'training_modules' | 'videos';

export function useDatabaseQuery<T = any>(
  tableName: TableName,
  options: {
    columns?: string;
    filter?: Record<string, any>;
    eq?: [string, any];
    in?: [string, any[]];
    order?: [string, { ascending: boolean }];
    limit?: number;
    single?: boolean;
    range?: [number, number];
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Only run query if user is logged in
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      // Type assertion to fix the deep type instantiation error
      const query = supabase.from(tableName as any).select(options.columns || '*');
      
      // Apply filter if provided
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query.eq(key, value);
        });
      }
      
      // Apply eq filter if provided
      if (options.eq) {
        query.eq(options.eq[0], options.eq[1]);
      }
      
      // Apply in filter if provided
      if (options.in) {
        query.in(options.in[0], options.in[1]);
      }
      
      // Apply order if provided
      if (options.order) {
        query.order(options.order[0], { ascending: options.order[1].ascending });
      }
      
      // Apply limit if provided
      if (options.limit) {
        query.limit(options.limit);
      }
      
      // Apply range if provided
      if (options.range) {
        query.range(options.range[0], options.range[1]);
      }
      
      // Get single result if specified
      if (options.single) {
        const { data: result, error } = await query.single();
        
        if (error) throw error;
        setData(result as T);
      } else {
        const { data: result, error } = await query;
        
        if (error) throw error;
        setData(result as T);
      }
      
    } catch (error: any) {
      console.error(`Error fetching data from ${tableName}:`, error.message);
      setError(error);
      toast.error(`Failed to fetch data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [tableName, options.columns, JSON.stringify(options.filter), 
      JSON.stringify(options.eq), JSON.stringify(options.in), 
      JSON.stringify(options.order), options.limit, options.single, 
      JSON.stringify(options.range), user?.id]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Return the refetch function along with data, error, and isLoading
  return { data, error, isLoading, refetch: fetchData };
}

export function useRealTimeSubscription<T = any>(
  tableName: TableName,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  callback?: (payload: any) => void
) {
  const [data, setData] = useState<T | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    // Only set up subscription if user is logged in
    if (!user) return;
    
    // Create a channel to listen for changes
    const channel = supabase
      .channel('schema-db-changes')
      // Use type assertion to fix the type error with postgres_changes
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table: tableName
        },
        (payload) => {
          // Access the data in the payload safely, checking first if 'new' exists
          if (payload && 'new' in payload) {
            setData(payload.new as T);
            if (callback) callback(payload);
          }
        }
      )
      .subscribe();
      
    // Clean up subscription on unmount
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [tableName, event, user?.id, callback]);
  
  return { data };
}

// Add a new function to update application status
export async function updateApplicationStatus(userId: string, applicationData: {
  resume?: string | null;
  about_me_video?: string | null;
  sales_pitch_video?: string | null;
}) {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .update({
        ...applicationData,
      })
      .eq('id', userId);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error updating application status:", error);
    return { data: null, error };
  }
}

export default useDatabaseQuery;
