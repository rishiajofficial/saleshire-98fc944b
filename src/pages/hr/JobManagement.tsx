
import React, { useState, useEffect } from "react";
import MainLayout from '@/components/layout/MainLayout';
import { Loader2 } from "lucide-react";
import { Job } from "@/types/job";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import JobCreationDialog from "@/components/jobs/JobCreationDialog";
import JobList from "@/components/jobs/JobList";

const JobManagement = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assessments, setAssessments] = useState<{ id: string; title: string; }[]>([]);
  const [trainingModules, setTrainingModules] = useState<{ id: string; title: string; }[]>([]);

  const fetchJobs = async () => {
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData as Job[] || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssessmentsAndTraining = async () => {
    try {
      const assessmentsResult = await supabase
        .from('assessments')
        .select('id, title');

      const trainingResult = await supabase
        .from('training_modules')
        .select('id, title');

      if (assessmentsResult.error) throw assessmentsResult.error;
      if (trainingResult.error) throw trainingResult.error;

      setAssessments(assessmentsResult.data || []);
      setTrainingModules(trainingResult.data || []);
    } catch (error: any) {
      console.error('Error fetching assessments and training:', error);
      toast.error('Failed to load assessments and training modules');
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchAssessmentsAndTraining();
  }, []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Job Management</h1>
          <JobCreationDialog
            onJobCreated={fetchJobs}
            assessments={assessments}
            trainingModules={trainingModules}
          />
        </div>

        <JobList jobs={jobs} onJobDeleted={fetchJobs} />
      </div>
    </MainLayout>
  );
};

export default JobManagement;
