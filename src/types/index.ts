
// Let's make sure our UserRole type is available globally
export type UserRole = 'admin' | 'manager' | 'candidate' | 'hr' | 'director';

// Add Region type that's being used in Register.tsx
export type Region = 'north' | 'south' | 'east' | 'west' | 'central';

// Add Interview type that's being used in InterviewList.tsx and ManagerDashboard.tsx
export type Interview = {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  managerId: string;
  scheduledAt: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
};
