export type UserRole = 'candidate' | 'manager' | 'admin' | 'hr' | 'director';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface Application {
  id: string;
  job_id: string;
  job_title?: string;
  candidate_id: string;
  candidate_name?: string;
  candidate_email?: string;
  status: string;
  candidate_status?: string;
  created_at: string;
  updated_at: string;
  assessment_results?: any[];
  tags?: string[];
}
