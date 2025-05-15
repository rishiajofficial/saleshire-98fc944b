
export * from './common';
export * from './job';
export * from './candidate';
export * from './training';
export * from './training-progress';

// Add or update UserRole type to include 'director'
export type UserRole = 'candidate' | 'manager' | 'hr' | 'admin' | 'director';
