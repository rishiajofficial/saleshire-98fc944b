
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
    join?: {
      table: TableName;
      on: [string, string];
      columns?: string;
    }[];
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
      let query = supabase.from(tableName as any);
      
      // Handle joins if provided
      if (options.join && options.join.length > 0) {
        // For joins, we need to use select with specific columns
        const selectColumns = options.columns || '*';
        
        // Create the query with joins
        query = query.select(selectColumns, { 
          count: 'exact',
          // Add foreign tables to fetch related data
          ...options.join.reduce((acc, join) => {
            acc[join.table] = {
              columns: join.columns || '*',
            };
            return acc;
          }, {} as Record<string, {columns: string}>)
        });
      } else {
        // If no joins, use the standard select
        query = query.select(options.columns || '*');
      }
      
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
  }, [tableName, options.columns, JSON.stringify(options.filter), 
      JSON.stringify(options.eq), JSON.stringify(options.in), 
      JSON.stringify(options.order), options.limit, options.single, 
      JSON.stringify(options.range), JSON.stringify(options.join), 
      user?.id]);

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
  status?: string;
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

// Add a new function to manage interviews
export async function manageInterview(interview: {
  id?: string;
  candidate_id: string;
  manager_id: string;
  scheduled_at: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  action: 'create' | 'update' | 'cancel';
}) {
  try {
    let result;
    
    if (interview.action === 'create') {
      // Create new interview
      const { data, error } = await supabase
        .from('interviews')
        .insert({
          candidate_id: interview.candidate_id,
          manager_id: interview.manager_id,
          scheduled_at: interview.scheduled_at,
          status: interview.status || 'scheduled',
          notes: interview.notes || ''
        })
        .select();
      
      if (error) throw error;
      result = { data, error: null };
    } 
    else if (interview.action === 'update' && interview.id) {
      // Update existing interview
      const { data, error } = await supabase
        .from('interviews')
        .update({
          scheduled_at: interview.scheduled_at,
          status: interview.status,
          notes: interview.notes
        })
        .eq('id', interview.id)
        .select();
      
      if (error) throw error;
      result = { data, error: null };
    } 
    else if (interview.action === 'cancel' && interview.id) {
      // Cancel interview
      const { data, error } = await supabase
        .from('interviews')
        .update({
          status: 'cancelled'
        })
        .eq('id', interview.id)
        .select();
      
      if (error) throw error;
      result = { data, error: null };
    }
    
    return result;
  } catch (error: any) {
    console.error("Error managing interview:", error);
    return { data: null, error };
  }
}

export default useDatabaseQuery;
