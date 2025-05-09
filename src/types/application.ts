
export interface Application {
  id: string;
  job_id: string;
  job_title?: string;
  job_department?: string;
  job_location?: string;
  job_employment_type?: string;
  job_salary_range?: string;
  candidate_id: string;
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  candidate_location?: string;
  status: string;
  candidate_status?: string;
  created_at: string;
  updated_at?: string;
  assessment_results?: any[];
  tags?: string[];
}
