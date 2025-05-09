
import React, { useState } from "react";
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
import { Search, X, SlidersHorizontal, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface ApplicationFilterValues {
  status: string | null;
  searchTerm: string;
  dateRange: string | null;
  department?: string | null;
  location?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

interface ApplicationFiltersProps {
  filters: ApplicationFilterValues;
  onFilterChange: (filters: ApplicationFilterValues) => void;
  onReset: () => void;
  departments?: string[];
  locations?: string[];
}

export const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  departments = [],
  locations = [],
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value === 'all' ? null : value,
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
      dateRange: value === 'all' ? null : value,
    });
  };

  const handleDepartmentChange = (value: string) => {
    onFilterChange({
      ...filters,
      department: value === 'all' ? null : value,
    });
  };

  const handleLocationChange = (value: string) => {
    onFilterChange({
      ...filters,
      location: value === 'all' ? null : value,
    });
  };

  const handleDateSelect = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (date) {
      onFilterChange({
        ...filters,
        [field]: date,
      });
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.searchTerm) count++;
    if (filters.dateRange) count++;
    if (filters.department) count++;
    if (filters.location) count++;
    if (filters.startDate || filters.endDate) count++;
    return count;
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
      
      <div className="flex items-center justify-between">
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Advanced Filters
              {getActiveFiltersCount() > 3 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 rounded-full">
                  {getActiveFiltersCount() - 3}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Advanced Filters</h4>
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Department</p>
                <Select value={filters.department || 'all'} onValueChange={handleDepartmentChange}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Location</p>
                <Select value={filters.location || 'all'} onValueChange={handleLocationChange}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Custom Date Range</p>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.startDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.startDate ? (
                          format(filters.startDate, "PPP")
                        ) : (
                          <span>Start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.startDate || undefined}
                        onSelect={(date) => handleDateSelect('startDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.endDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.endDate ? (
                          format(filters.endDate, "PPP")
                        ) : (
                          <span>End date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.endDate || undefined}
                        onSelect={(date) => handleDateSelect('endDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      
        {(getActiveFiltersCount() > 0) && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onReset}
            className="h-8 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Reset filters
          </Button>
        )}
      </div>
    </div>
  );
};
