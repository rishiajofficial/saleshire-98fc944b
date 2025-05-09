import React, { useEffect, useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { useJobApplications } from '@/hooks/useJobApplications';
import JobCreationDialog from '@/components/jobs/JobCreationDialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import JobList from '@/components/jobs/JobList';
import { Job } from '@/types/job';
import MainLayout from '@/components/layout/MainLayout';
import { JobAnalytics } from '@/components/jobs/JobAnalytics';
import { JobTemplates } from '@/components/jobs/JobTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApplicationFilters, ApplicationFilterValues } from '@/components/applications/ApplicationFilters';
import { Loader2, Plus, RefreshCw } from 'lucide-react';

interface EditingJob {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  employment_type: string;
  salary_range: string;
  selectedAssessment: string;
  selectedModules: string[];
  status?: string;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

const JobManagementPage = () => {
  const { jobs, loading, error, fetchJobs, createJob, updateJob, deleteJob } = useJobs();
  const [assessments, setAssessments] = useState<{ id: string; title: string }[]>([]);
  const [filters, setFilters] = useState<ApplicationFilterValues>({
    status: null,
    searchTerm: '',
    dateRange: null,
    department: null,
    location: null,
  });
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const { data: applications = [], isLoading: loadingApplications } = useJobApplications();
  const [uniqueDepartments, setUniqueDepartments] = useState<string[]>([]);
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const [showJobCreationDialog, setShowJobCreationDialog] = useState(false);
  const [templateData, setTemplateData] = useState<EditingJob | null>(null);
  
  useEffect(() => {
    fetchJobs();
    fetchAssessments();
  }, []);
  
  useEffect(() => {
    if (jobs.length > 0) {
      // Extract unique departments and locations
      const departments = Array.from(new Set(jobs.filter(job => job.department).map(job => job.department as string)));
      const locations = Array.from(new Set(jobs.filter(job => job.location).map(job => job.location as string)));
      
      setUniqueDepartments(departments);
      setUniqueLocations(locations);
    }
  }, [jobs]);
  
  useEffect(() => {
    filterJobs();
  }, [filters, jobs]);
  
  const filterJobs = () => {
    let result = [...jobs];
    
    // Apply search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(term) || 
        job.description.toLowerCase().includes(term) ||
        (job.department && job.department.toLowerCase().includes(term)) ||
        (job.location && job.location.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(job => job.status === filters.status);
    }
    
    // Apply department filter
    if (filters.department) {
      result = result.filter(job => job.department === filters.department);
    }
    
    // Apply location filter
    if (filters.location) {
      result = result.filter(job => job.location === filters.location);
    }
    
    // Apply date filter
    if (filters.dateRange) {
      const now = new Date();
      let startDate;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        result = result.filter(job => new Date(job.created_at) >= startDate);
      }
    }
    
    // Apply custom date range if both dates are set
    if (filters.startDate && filters.endDate) {
      result = result.filter(job => {
        const jobDate = new Date(job.created_at);
        return jobDate >= filters.startDate! && jobDate <= filters.endDate!;
      });
    }
    
    setFilteredJobs(result);
  };
  
  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, title')
        .eq('archived', false);
      
      if (error) throw error;
      setAssessments(data || []);
    } catch (err: any) {
      toast.error(`Failed to fetch assessments: ${err.message}`);
    }
  };
  
  const handleJobCreated = async (jobData: any) => {
    try {
      await createJob(jobData);
      toast.success("Job created successfully!");
      setShowJobCreationDialog(false);
    } catch (err: any) {
      toast.error(`Failed to create job: ${err.message}`);
    }
  };

  const handleJobUpdated = async (jobData: any) => {
    try {
      await updateJob(jobData);
      toast.success("Job updated successfully!");
    } catch (err: any) {
      toast.error(`Failed to update job: ${err.message}`);
    }
  };

  const handleJobDeleted = async (jobId: string) => {
    try {
      const result = await deleteJob(jobId);
      if (result) {
        toast.success("Job deleted successfully!");
      }
    } catch (err: any) {
      toast.error(`Failed to delete job: ${err.message}`);
    }
  };
  
  const handleJobArchived = async (jobId: string, archived: boolean) => {
    try {
      // Get the job to update
      const jobToUpdate = jobs.find(job => job.id === jobId);
      if (!jobToUpdate) {
        toast.error("Job not found");
        return;
      }
      
      // Ensure all required properties are present in the job data
      const updatedJob = {
        ...jobToUpdate,
        archived,
        department: jobToUpdate.department || "",
        location: jobToUpdate.location || "",
        employment_type: jobToUpdate.employment_type || "",
        salary_range: jobToUpdate.salary_range || "",
        selectedAssessment: jobToUpdate.selectedAssessment || null,
        selectedModules: jobToUpdate.selectedModules || []
      };
      
      await updateJob(updatedJob);
      toast.success(`Job ${archived ? "archived" : "unarchived"} successfully!`);
    } catch (err: any) {
      toast.error(`Failed to update job: ${err.message}`);
    }
  };
  
  const handleRefresh = () => {
    fetchJobs();
    fetchAssessments();
    toast.success("Data refreshed");
  };
  
  const handleResetFilters = () => {
    setFilters({
      status: null,
      searchTerm: '',
      dateRange: null,
      department: null,
      location: null,
      startDate: null,
      endDate: null
    });
  };
  
  const handleTemplateSelected = (template: Partial<Job>) => {
    // Create a complete EditingJob object with required fields
    const templateWithRequiredFields: EditingJob = {
      id: '',  // Add a temporary ID that will be replaced on creation
      title: template.title || '',
      description: template.description || '',
      department: template.department || '',
      location: template.location || '',
      employment_type: template.employment_type || '',
      salary_range: template.salary_range || '',
      selectedAssessment: template.selectedAssessment || 'none',
      selectedModules: template.selectedModules || [],
      status: template.status || 'active',
      archived: template.archived,
      created_at: template.created_at,
      updated_at: template.updated_at,
      created_by: template.created_by
    };
    
    setTemplateData(templateWithRequiredFields);
    setShowJobCreationDialog(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    </div>;
  }

  if (error) {
    return <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
      Error: {error}
    </div>;
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Job Management</h1>
          <div className="flex gap-2">
            <JobTemplates onSelectTemplate={handleTemplateSelected} />
            <Button 
              onClick={() => setShowJobCreationDialog(true)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" /> New Job
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="jobs">
          <TabsList className="mb-6">
            <TabsTrigger value="jobs">Job Listings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="jobs">
            <div className="mb-6">
              <ApplicationFilters 
                filters={filters}
                onFilterChange={setFilters}
                onReset={handleResetFilters}
                departments={uniqueDepartments}
                locations={uniqueLocations}
              />
            </div>
            
            <JobList 
              jobs={filteredJobs}
              onJobDeleted={handleJobDeleted}
              onJobUpdated={handleJobUpdated}
              onJobArchived={handleJobArchived}
              assessments={assessments}
              categories={[]} // Pass empty array for categories since job_categories table was removed
            />
          </TabsContent>
          
          <TabsContent value="analytics">
            <JobAnalytics jobs={jobs} applications={applications} />
          </TabsContent>
        </Tabs>
        
        {showJobCreationDialog && (
          <JobCreationDialog 
            onJobCreated={handleJobCreated}
            assessments={assessments}
            isOpen={showJobCreationDialog}
            onClose={() => {
              setShowJobCreationDialog(false);
              setTemplateData(null);
            }}
            editingJob={templateData || undefined}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default JobManagementPage;
