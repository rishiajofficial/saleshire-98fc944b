
import React, { useState } from "react";
import MainLayout from '@/components/layout/MainLayout';
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import JobCreationDialog from "@/components/jobs/JobCreationDialog";
import JobList from "@/components/jobs/JobList";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";

const JobManagement = () => {
  const { jobs, isLoading, createJob, deleteJob } = useJobs();
  const [assessments, setAssessments] = useState<{ id: string; title: string; }[]>([]);
  const [trainingModules, setTrainingModules] = useState<{ id: string; title: string; }[]>([]);

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

  React.useEffect(() => {
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
            onJobCreated={createJob.mutate}
            assessments={assessments}
            trainingModules={trainingModules}
          />
        </div>
        <JobList jobs={jobs || []} onJobDeleted={deleteJob.mutate} />
      </div>
    </MainLayout>
  );
};

export default JobManagement;
