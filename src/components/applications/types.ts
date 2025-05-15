// Define shared types for application components
export interface ApplicationFilterValues {
  status: string[];
  search?: string;
  sortBy?: string;
  searchTerm?: string; // Added this to match what's used in ApplicationsList
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
}
