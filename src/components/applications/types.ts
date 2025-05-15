
// Define shared types for application components
import { DateRange } from "react-day-picker";

export interface ApplicationFilterValues {
  status: string[];
  search?: string;
  sortBy?: string;
  searchTerm?: string; // Added this to match what's used in ApplicationsList
  dateRange?: DateRange;
}
