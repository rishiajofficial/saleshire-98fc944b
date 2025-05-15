
import React from 'react';
import { ApplicationFilterValues } from './types';

export interface ApplicationFiltersProps {
  filters: ApplicationFilterValues;
  onFilterChange: (filters: ApplicationFilterValues) => void;
  onReset?: () => void; // Make onReset optional
}

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { PopoverClose } from "@radix-ui/react-popover"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { DateRange } from "react-day-picker"

const filterSchema = z.object({
  status: z.array(z.string()).optional(),
  searchTerm: z.string().optional(),
  sortBy: z.string().optional(),
  dateRange: z.object({
    from: z.date().nullable(),
    to: z.date().nullable(),
  }).optional(),
})

type FilterSchemaType = z.infer<typeof filterSchema>

const statusOptions = [
  {
    label: "Applied",
    value: "applied",
  },
  {
    label: "Interviewing",
    value: "interviewing",
  },
  {
    label: "Offer",
    value: "offer",
  },
  {
    label: "Hired",
    value: "hired",
  },
]

const sortOptions = [
  {
    label: "Newest",
    value: "newest",
  },
  {
    label: "Oldest",
    value: "oldest",
  },
]

const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({ filters, onFilterChange, onReset }) => {
  const form = useForm<FilterSchemaType>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: filters.status,
      searchTerm: filters.searchTerm,
      sortBy: filters.sortBy,
      dateRange: filters.dateRange as DateRange | undefined,
    },
    mode: "onChange",
  })

  const handleFilterChange = (values: FilterSchemaType) => {
    onFilterChange({
      status: values.status || [],
      searchTerm: values.searchTerm,
      sortBy: values.sortBy,
      dateRange: values.dateRange as DateRange | undefined,
    })
  }

  const handleReset = () => {
    form.reset()
    onReset?.()
  }

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
                                  field.onChange([...(field.value || []), status.value])
                                } else {
                                  field.onChange(field.value?.filter((v) => v !== status.value))
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
                      <Input placeholder="Search by name or email..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sortBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort by</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={form.watch("sortBy") !== undefined}
                          className={cn(
                            "w-full justify-between",
                            form.watch("sortBy") && "text-muted-foreground"
                          )}
                        >
                          {sortOptions.find((option) => option.value === form.watch("sortBy"))?.label || "Sort by"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandList>
                            <CommandEmpty>No framework found.</CommandEmpty>
                            {sortOptions.map((option) => (
                              <CommandItem
                                value={option.label}
                                key={option.value}
                                onSelect={() => {
                                  form.setValue("sortBy", option.value)
                                }}
                              >
                                {option.label}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    form.watch("sortBy") === option.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !field.value?.from ? "text-muted-foreground" : ""
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              `${format(field.value.from, "MMM dd, yyyy")} - ${format(field.value.to, "MMM dd, yyyy")}`
                            ) : (
                              format(field.value.from, "MMM dd, yyyy")
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="range"
                          defaultMonth={field.value?.from ? field.value?.from : new Date()}
                          selected={field.value as DateRange}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("2020-01-01")
                          }
                          numberOfMonths={2}
                          className="p-3 pointer-events-auto"
                        />
                        <PopoverClose>
                          <Button variant="secondary" className="w-full">
                            Close
                          </Button>
                        </PopoverClose>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="ghost" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit">Apply Filters</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default ApplicationFilters;
