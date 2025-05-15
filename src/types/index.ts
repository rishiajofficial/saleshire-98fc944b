// Add ApplicationStatus if it doesn't exist
export enum ApplicationStatus {
  APPLIED = 'applied',
  INTERVIEWING = 'interviewing',
  OFFER = 'offer',
  HIRED = 'hired',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

export type UserRole = 'hr' | 'manager' | 'candidate' | 'admin';
