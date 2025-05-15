import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Filter } from "lucide-react";
import { ApplicationFilterValues } from "./types";

export interface ApplicationFiltersProps {
  filters: ApplicationFilterValues;
  onFilterChange: (filters: ApplicationFilterValues) => void;
  onReset: () => void;
}

export const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const handleStatusChange = (status: string) => {
    onFilterChange({ 
      ...filters, 
      status: status === 'all' ? null : status 
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchTerm: e.target.value
    });
  };

  const handleDateRangeChange = (range: string) => {
    onFilterChange({
      ...filters,
      dateRange: range === 'all' ? null : range
    });
  };

  const hasActiveFilters = filters.status || filters.searchTerm || filters.dateRange;

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Search input */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates or jobs..."
              value={filters.searchTerm}
              onChange={handleSearchChange}
              className="pl-8"
            />
            {filters.searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => onFilterChange({ ...filters, searchTerm: "" })}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Status filter */}
        <div className="w-[180px]">
          <Select 
            value={filters.status || 'all'} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="hr_review">HR Review</SelectItem>
              <SelectItem value="hr_approved">HR Approved</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="sales_task">Sales Task</SelectItem>
              <SelectItem value="manager_interview">Interview</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date range filter */}
        <div className="w-[180px]">
          <Select
            value={filters.dateRange || 'all'}
            onValueChange={handleDateRangeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset filters button */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={onReset}>
            <X className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
};
