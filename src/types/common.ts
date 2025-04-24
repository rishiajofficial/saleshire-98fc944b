
export interface ActivityLog {
  id: string;
  user_id: string;
  name?: string;
  role?: string;
  action: string;
  entity_type: string;
  created_at: string;
  details?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  region?: string;
}

export interface CandidateProfile extends UserProfile {
  current_step?: number;
  status?: string;
}
