
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'sonner';

// StatusValidation for application status updates
const VALID_APPLICATION_STATUSES = [
  'applied', 
  'application_in_progress', 
  'hr_review', 
  'hr_approved', 
  'training', 
  'manager_interview', 
  'paid_project',
  'sales_task',
  'hired', 
  'rejected', 
  'archived'
];

export type TableName = 'activity_logs' | 'assessment_results' | 'assessment_sections' | 
                        'assessments' | 'candidates' | 'interviews' | 'manager_regions' | 
                        'managers' | 'profiles' | 'questions' | 'sales_tasks' | 'shops' | 
                        'training_modules' | 'training_categories';

export interface QueryOptions {
  filter?: Record<string, any>;
  columns?: string;
  order?: [string, { ascending: boolean }];
  range?: [number, number];
  foreignTable?: string;
}

interface UpdateApplicationStatusParams {
  status: string;
  [key: string]: any;
}

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

      const { data, error } = await query;

      if (error) {
        setError(error);
        console.error(`Error fetching ${tableName}:`, error.message);
        return;
      }

      setData(data);
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

// Add the missing functions needed by other components
export async function updateApplicationStatus(candidateId: string, params: UpdateApplicationStatusParams) {
  try {
    // Validate status
    if (params.status && !VALID_APPLICATION_STATUSES.includes(params.status)) {
      throw new Error(`Invalid status: ${params.status}. Valid options are: ${VALID_APPLICATION_STATUSES.join(', ')}`);
    }

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

export interface InterviewData {
  id?: string;
  candidate_id: string;
  manager_id: string;
  scheduled_at: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  action: 'create' | 'update' | 'cancel';
}

export async function manageInterview(interviewData: InterviewData) {
  try {
    // Handle different operations based on action
    const { action, ...data } = interviewData;
    let result;

    switch (action) {
      case 'create':
        result = await supabase
          .from('interviews')
          .insert({
            candidate_id: data.candidate_id,
            manager_id: data.manager_id,
            scheduled_at: data.scheduled_at,
            status: data.status,
            notes: data.notes
          })
          .select()
          .single();
        break;
      case 'update':
        if (!data.id) {
          throw new Error('Interview ID is required for updates');
        }
        result = await supabase
          .from('interviews')
          .update({
            manager_id: data.manager_id,
            scheduled_at: data.scheduled_at,
            status: data.status,
            notes: data.notes
          })
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

// Default export for components that use it as default
const useDatabaseQueryDefault = useDatabaseQuery;
export default useDatabaseQueryDefault;
