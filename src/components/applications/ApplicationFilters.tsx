
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export interface ApplicationFilterValues {
  status: string | null;
  searchTerm: string;
  dateRange: string | null; // 'today', 'week', 'month', 'all'
}

interface ApplicationFiltersProps {
  filters: ApplicationFilterValues;
  onFilterChange: (filters: ApplicationFilterValues) => void;
  onReset: () => void;
}

export const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchTerm: e.target.value,
    });
  };

  const handleDateRangeChange = (value: string) => {
    onFilterChange({
      ...filters,
      dateRange: value,
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Input
            placeholder="Search by name or email"
            value={filters.searchTerm}
            onChange={handleSearchChange}
            className="pl-9"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        
        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="hr_review">HR Review</SelectItem>
              <SelectItem value="hr_approved">HR Approved</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="manager_interview">Interview</SelectItem>
              <SelectItem value="sales_task">Sales Task</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select value={filters.dateRange || 'all'} onValueChange={handleDateRangeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {(filters.status || filters.searchTerm || filters.dateRange) && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onReset}
            className="h-8 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Reset filters
          </Button>
        </div>
      )}
    </div>
  );
};
