
export interface Job {
  id: string;
  title: string;
  description: string;
  status: string; // Changed from 'active' | 'inactive' to string to match database value
  created_at?: string;
  created_by?: string;
  updated_at?: string;
}

export interface JobAssessment {
  job_id: string;
  assessment_id: string;
}

export interface JobTraining {
  job_id: string;
  training_module_id: string;
}
