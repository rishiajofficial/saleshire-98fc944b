import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

export type TableName = 'activity_logs' | 'assessment_results' | 'assessment_sections' | 
                        'assessments' | 'candidates' | 'interviews' | 'manager_regions' | 
                        'managers' | 'profiles' | 'questions' | 'sales_tasks' | 'shops' | 
                        'training_modules' | 'videos' | 'job_applications' | 'job_assessments' |
                        'job_training' | 'module_assessments' | 'module_videos' |
                        'quiz_results' | 'training_progress';

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
      
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      let query: any = supabase.from(tableName);
      
      if (options.join && options.join.length > 0) {
        const selectColumns = options.columns || '*';
        query = query.select(selectColumns, { 
          count: 'exact',
          ...options.join.reduce((acc, join) => {
            acc[join.table] = {
              columns: join.columns || '*',
            };
            return acc;
          }, {} as Record<string, {columns: string}>)
        });
      } else {
        query = query.select(options.columns || '*');
      }
      
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (options.eq) {
        query = query.eq(options.eq[0], options.eq[1]);
      }
      
      if (options.in) {
        query = query.in(options.in[0], options.in[1]);
      }
      
      if (options.order) {
        query = query.order(options.order[0], { ascending: options.order[1].ascending });
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.range) {
        query = query.range(options.range[0], options.range[1]);
      }
      
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    if (!user) return;
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table: tableName
        },
        (payload) => {
          if (payload && 'new' in payload) {
            setData(payload.new as T);
            if (callback) callback(payload);
          }
        }
      )
      .subscribe();
      
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [tableName, event, user?.id, callback]);
  
  return { data };
}

const getStepFromStatus = (status?: string): number | undefined => {
  if (!status) return undefined;
  const lowerStatus = status.toLowerCase();
  switch (lowerStatus) {
    case "profile_created":
      return 0;
    case "applied":
    case "application_in_progress":
      return 1;
    case "hr_review":
      return 2;
    case "hr_approved":
    case "training":
      return 3;
    case "manager_interview":
      return 4;
    case "paid_project":
    case "sales_task":
      return 5;
    case "hired":
      return 6;
    case "rejected":
    case "archived":
      return 7;
    default:
      return undefined;
  }
};

export const updateApplicationStatus = async (
  candidateId: string, 
  applicationData: {
    status?: string;
    resume?: string | null;
    about_me_video?: string | null;
    sales_pitch_video?: string | null;
    job_title?: string | null;
  }
) => {
  try {
    const updatePayload: Partial<Database['public']['Tables']['candidates']['Row']> = {
      ...applicationData,
    };

    const validStatuses = [
      'profile_created',
      'applied',
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
    
    // Handle special case for "Applied to job: [job name]"
    let normalizedStatus = applicationData.status || '';
    if (normalizedStatus.toLowerCase().startsWith('applied to job:')) {
      normalizedStatus = 'applied';
    } else {
      normalizedStatus = normalizedStatus.toLowerCase();
    }
    
    if (applicationData.status) {
      if (!validStatuses.includes(normalizedStatus) && !normalizedStatus.startsWith('applied to job:')) {
        throw new Error(`Invalid status: ${applicationData.status}. Allowed statuses are: ${validStatuses.join(', ')}`);
      }
      updatePayload.status = applicationData.status;
    }

    if (updatePayload.status) {
      const newStep = getStepFromStatus(normalizedStatus);
      if (newStep !== undefined) {
        updatePayload.current_step = newStep;
      }
    }
    
    console.log("Updating candidate status with payload:", updatePayload);

    const { data, error } = await supabase
      .from('candidates')
      .update(updatePayload)
      .eq('id', candidateId)
      .select();

    if (error) {
      console.error("Supabase error while updating status:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('No candidate found with that ID');
    }

    // Log activity
    if (updatePayload.status) {
      await supabase.from('activity_logs').insert({
        user_id: candidateId,
        action: 'status_change',
        entity_type: 'job_application',
        entity_id: candidateId,
        details: {
          new_status: normalizedStatus,
          job_title: applicationData.job_title || '',
          notes: `Status updated to ${updatePayload.status}`
        }
      });
    }

    return { data: data[0], error: null };
  } catch (error: unknown) {
    const message = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred while updating status';
    
    console.error("Update status error:", message);
    return { data: null, error: new Error(message) };
  }
};

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
