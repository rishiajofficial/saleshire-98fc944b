
export interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  department?: string;
  location?: string;
  employment_type?: string; // e.g. Full-time, Part-time, Contract
  salary_range?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  archived?: boolean;
  // These might be used in the application but are not part of the DB schema
  selectedAssessment?: string | null;
  selectedModules?: string[] | null;
}

export interface JobAssessment {
  job_id: string;
  assessment_id: string;
}

export interface JobTraining {
  job_id: string;
  training_module_id: string;
}
