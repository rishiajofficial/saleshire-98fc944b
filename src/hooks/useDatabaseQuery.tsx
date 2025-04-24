
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Expanded type definitions
export type TableName = 
  'activity_logs' | 'assessment_results' | 'assessment_sections' | 
  'assessments' | 'candidates' | 'interviews' | 'manager_regions' | 
  'managers' | 'profiles' | 'questions' | 'sales_tasks' | 'shops' | 
  'training_modules' | 'training_categories' | 'videos';

// Generic interface for query options
export interface QueryOptions {
  filter?: Record<string, any>;
  columns?: string;
  order?: [string, { ascending: boolean }];
  range?: [number, number];
  foreignTable?: string;
  limit?: number;
}

// Type-safe function for database queries
export function useDatabaseQuery<T = any>(tableName: TableName, options: QueryOptions = {}) {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<PostgrestError | Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase.from(tableName).select(options.columns || '*');

      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      if (options.order) {
        query = query.order(options.order[0], { ascending: options.order[1].ascending });
      }

      if (options.range) {
        query = query.range(options.range[0], options.range[1]);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        setError(error);
        console.error(`Error fetching ${tableName}:`, error.message);
        return;
      }

      setData(data as T[]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(new Error(errorMsg));
      console.error(`Exception fetching ${tableName}:`, errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableName, JSON.stringify(options)]);

  const refetch = () => {
    fetchData();
  };

  return { data, error, isLoading, refetch };
}

// Additional exports for specific use cases
export async function updateApplicationStatus(candidateId: string, params: any) {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .update(params)
      .eq('id', candidateId)
      .select()
      .single();

    if (error) {
      console.error("Database error updating status:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in updateApplicationStatus:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update application status' 
    };
  }
}

export async function manageInterview(interviewData: any) {
  try {
    const { action, ...data } = interviewData;
    let result;

    switch (action) {
      case 'create':
        result = await supabase
          .from('interviews')
          .insert(data)
          .select()
          .single();
        break;
      case 'update':
        if (!data.id) {
          throw new Error('Interview ID is required for updates');
        }
        result = await supabase
          .from('interviews')
          .update(data)
          .eq('id', data.id)
          .select()
          .single();
        break;
      case 'cancel':
        if (!data.id) {
          throw new Error('Interview ID is required for cancellation');
        }
        result = await supabase
          .from('interviews')
          .update({ status: 'cancelled' })
          .eq('id', data.id)
          .select()
          .single();
        break;
      default:
        throw new Error(`Invalid interview action: ${action}`);
    }

    if (result.error) {
      throw result.error;
    }

    return { data: result.data, error: null };
  } catch (error) {
    console.error("Error in manageInterview:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to manage interview')
    };
  }
}

export default useDatabaseQuery;
