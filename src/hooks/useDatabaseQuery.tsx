
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

// Valid table names from our Supabase database
type TableName = 
  | 'profiles' 
  | 'assessments' 
  | 'candidates' 
  | 'managers' 
  | 'assessment_sections' 
  | 'sales_tasks' 
  | 'activity_logs' 
  | 'assessment_results' 
  | 'interviews' 
  | 'manager_regions' 
  | 'questions' 
  | 'shops' 
  | 'training_modules' 
  | 'videos';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Only run query if user is logged in
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        let query = supabase.from(tableName).select(options.columns || '*');
        
        // Apply filter if provided
        if (options.filter) {
          Object.entries(options.filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        
        // Apply eq filter if provided
        if (options.eq) {
          query = query.eq(options.eq[0], options.eq[1]);
        }
        
        // Apply in filter if provided
        if (options.in) {
          query = query.in(options.in[0], options.in[1]);
        }
        
        // Apply order if provided
        if (options.order) {
          query = query.order(options.order[0], { ascending: options.order[1].ascending });
        }
        
        // Apply limit if provided
        if (options.limit) {
          query = query.limit(options.limit);
        }
        
        // Apply range if provided
        if (options.range) {
          query = query.range(options.range[0], options.range[1]);
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
    };

    fetchData();
  }, [tableName, options.columns, JSON.stringify(options.filter), 
      JSON.stringify(options.eq), JSON.stringify(options.in), 
      JSON.stringify(options.order), options.limit, options.single, 
      JSON.stringify(options.range), user?.id]);

  return { data, error, isLoading };
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
    
    // Fix for postgres_changes - this is the correct event type
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table: tableName
        },
        (payload) => {
          setData(payload.new as T);
          if (callback) callback(payload);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, event, user?.id]);
  
  return { data };
}

export default useDatabaseQuery;
