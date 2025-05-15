
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Job } from '@/types/job';

// Form schema with validation
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Job title must be at least 2 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  department: z.string().optional(),
  location: z.string().optional(),
  employment_type: z.string().optional(),
  salary_range: z.string().optional(),
  status: z.string().default("active"),
  selectedAssessment: z.string().nullable().optional(),
  selectedModules: z.array(z.string()).optional(),
  is_public: z.boolean().default(false),
});

interface JobFormProps {
  onSubmit: (data: any) => void;
  job?: Job;
  isSubmitting?: boolean;
  assessments?: { id: string; title: string }[];
  modules?: any[];
  mode?: "view" | "create" | "edit";
}

export default function JobForm({ onSubmit, job, isSubmitting = false, assessments = [], modules = [], mode = "create" }: JobFormProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);

  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: job?.title || "",
      description: job?.description || "",
      department: job?.department || "",
      location: job?.location || "",
      employment_type: job?.employment_type || "",
      salary_range: job?.salary_range || "",
      status: job?.status || "active",
      selectedAssessment: job?.selectedAssessment || null,
      selectedModules: job?.selectedModules || [],
      is_public: job?.is_public || false,
    },
  });

  // Fetch assessments and training modules
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // If assessments and modules are provided as props, we don't need to fetch them
        if ((assessments && assessments.length > 0) || (modules && modules.length > 0)) {
          setLoading(false);
          return;
        }

        let assessmentsQuery = supabase
          .from('assessments')
          .select('id, title')
          .eq('archived', false);
        
        let modulesQuery = supabase
          .from('training_modules')
          .select('id, title')
          .eq('archived', false);
          
        // If we have a company profile, filter by company members
        if (profile?.company_id) {
          const { data: companyUsers } = await supabase
            .from('profiles')
            .select('id')
            .eq('company_id', profile.company_id);
            
          if (companyUsers && companyUsers.length > 0) {
            const userIds = companyUsers.map(user => user.id);
            assessmentsQuery = assessmentsQuery.in('created_by', userIds);
            modulesQuery = modulesQuery.in('created_by', userIds);
          }
        }
        
        // Execute queries
        const [assessmentsResult, modulesResult] = await Promise.all([
          assessmentsQuery,
          modulesQuery
        ]);
        
        if (assessmentsResult.error) throw assessmentsResult.error;
        if (modulesResult.error) throw modulesResult.error;
        
        // Skip since we're using props
      } catch (error) {
        console.error('Failed to load form data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [profile?.company_id, assessments, modules]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      id: job?.id,
    });
  };

  const isViewOnly = mode === "view";

  // Turn off form controls if in view-only mode
  const formReadonly = isViewOnly;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Sales Representative" {...field} disabled={formReadonly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="Sales" {...field} disabled={formReadonly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Remote, New York, etc." {...field} disabled={formReadonly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employment_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={formReadonly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="salary_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Range</FormLabel>
                <FormControl>
                  <Input placeholder="$60,000 - $80,000" {...field} disabled={formReadonly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={formReadonly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Job description and responsibilities"
                  className="min-h-[200px]"
                  {...field}
                  disabled={formReadonly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="selectedAssessment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assessment</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
                disabled={formReadonly}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an assessment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {assessments.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Optional: Select an assessment for candidates to complete
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="selectedModules"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Training Modules</FormLabel>
              <div className="flex flex-col space-y-2 mt-2">
                {modules.map((module) => (
                  <div key={module.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`module-${module.id}`}
                      value={module.id}
                      checked={field.value?.includes(module.id) || false}
                      onChange={(e) => {
                        if (formReadonly) return;
                        if (e.target.checked) {
                          field.onChange([...(field.value || []), module.id]);
                        } else {
                          field.onChange(
                            (field.value || []).filter((id) => id !== module.id)
                          );
                        }
                      }}
                      disabled={formReadonly}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor={`module-${module.id}`}>{module.title}</Label>
                  </div>
                ))}
              </div>
              <FormDescription>
                Optional: Select training modules for this job
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Public Job Listing</FormLabel>
                <FormDescription>
                  Make this job visible on the public careers page
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={formReadonly}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {!isViewOnly && (
          <Button type="submit" className="w-full" disabled={isSubmitting || formReadonly}>
            {isSubmitting ? "Saving..." : job ? "Update Job" : "Create Job"}
          </Button>
        )}
      </form>
    </Form>
  );
}
