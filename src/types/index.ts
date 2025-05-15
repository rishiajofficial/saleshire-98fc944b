
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

export type Region = 'north' | 'south' | 'east' | 'west' | 'central';

export interface Interview {
  id: string;
  candidateName?: string;
  scheduledAt: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  managerId: string;
  candidateId: string;
  feedback?: string;
  notes?: string;
}

export interface AssessmentWithStats {
  id: string;
  title: string;
  difficulty?: string;
  created_at: string;
  updated_at: string;
  submissions?: number;
  avgScore?: number;
}
