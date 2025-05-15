
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { PopoverClose } from "@radix-ui/react-popover";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DateRange } from "@/types";

// Define interfaces for the filter values
export interface ApplicationFilterValues {
  status: string[] | null;
  searchTerm: string | null;
  sortBy?: string | null;
  dateRange: DateRange | null;
}

interface ApplicationFiltersProps {
  filters: ApplicationFilterValues;
  onFilterChange: (filters: ApplicationFilterValues) => void;
  onReset?: () => void;
}

const filterSchema = z.object({
  status: z.array(z.string()).nullable(),
  searchTerm: z.string().nullable(),
  sortBy: z.string().nullable().optional(),
  dateRange: z.object({
    from: z.date().nullable(),
    to: z.date().nullable()
  }).nullable()
});

const statusOptions = [
  { label: "Applied", value: "applied" },
  { label: "Interviewing", value: "interviewing" },
  { label: "Offer", value: "offer" },
  { label: "Hired", value: "hired" }
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" }
];

export const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({ 
  filters, 
  onFilterChange,
  onReset
}) => {
  const form = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: filters.status,
      searchTerm: filters.searchTerm,
      sortBy: filters.sortBy,
      dateRange: filters.dateRange
    },
    mode: "onChange"
  });

  const handleFilterChange = (values: z.infer<typeof filterSchema>) => {
    onFilterChange({
      status: values.status || [],
      searchTerm: values.searchTerm,
      sortBy: values.sortBy,
      dateRange: values.dateRange
    });
  };

  const handleReset = () => {
    form.reset();
    onReset?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFilterChange)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Status</FormLabel>
                    <ScrollArea className="h-[200px] rounded-md border">
                      {statusOptions.map((status) => (
                        <div key={status.value} className="px-2 py-1.5">
                          <label
                            htmlFor={status.value}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={status.value}
                              value={status.value}
                              checked={field.value?.includes(status.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([
                                    ...(field.value || []),
                                    status.value
                                  ]);
                                } else {
                                  field.onChange(
                                    field.value?.filter((v) => v !== status.value)
                                  );
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{status.label}</span>
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="searchTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Search by name, email, job..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date Range</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value?.from ? (
                              field.value.to ? (
                                <>
                                  {format(field.value.from, "LLL dd, y")} -{" "}
                                  {format(field.value.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(field.value.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={field.value?.from}
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between">
              <Button type="submit" variant="default">
                Apply Filters
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
