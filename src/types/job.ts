
export interface Job {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  created_at?: string;
  created_by?: string;
  assessment_id?: string;
  training_modules?: string[];
}

export interface JobAssessment {
  job_id: string;
  assessment_id: string;
}

export interface JobTraining {
  job_id: string;
  training_module_id: string;
}
