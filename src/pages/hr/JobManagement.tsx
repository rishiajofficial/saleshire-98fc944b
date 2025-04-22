
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Job } from "@/types/job";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const JobManagement = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [trainingModules, setTrainingModules] = useState<any[]>([]);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    selectedAssessment: "",
    selectedTrainingModule: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchAssessmentsAndTraining();
  }, []);

  const fetchJobs = async () => {
    if (!user) return;

    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      
      setJobs(jobsData || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssessmentsAndTraining = async () => {
    try {
      const [assessmentsResult, trainingResult] = await Promise.all([
        supabase
          .from('assessments')
          .select('id, title')
          .eq('status', 'active'),
        supabase
          .from('training_modules')
          .select('id, title')
      ]);

      if (assessmentsResult.error) throw assessmentsResult.error;
      if (trainingResult.error) throw trainingResult.error;

      setAssessments(assessmentsResult.data || []);
      setTrainingModules(trainingResult.data || []);
    } catch (error) {
      console.error('Error fetching assessments and training:', error);
      toast.error('Failed to load assessments and training modules');
    }
  };

  const handleCreateJob = async () => {
    if (!user) return;

    try {
      // Insert job
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert({
          title: newJob.title,
          description: newJob.description,
          created_by: user.id,
          status: 'active'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Associate assessment if selected
      const jobAssessmentPromise = newJob.selectedAssessment
        ? supabase
            .from('job_assessments')
            .insert({
              job_id: jobData.id,
              assessment_id: newJob.selectedAssessment
            })
        : Promise.resolve();

      // Associate training module if selected
      const jobTrainingPromise = newJob.selectedTrainingModule
        ? supabase
            .from('job_training')
            .insert({
              job_id: jobData.id,
              training_module_id: newJob.selectedTrainingModule
            })
        : Promise.resolve();

      await Promise.all([jobAssessmentPromise, jobTrainingPromise]);

      // Refresh jobs list
      const { data: updatedJobs } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (updatedJobs) {
        setJobs(updatedJobs);
      }

      setDialogOpen(false);
      setNewJob({
        title: "",
        description: "",
        selectedAssessment: "",
        selectedTrainingModule: "",
      });
      toast.success('Job created successfully');
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      setJobs(jobs.filter(job => job.id !== jobId));
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Job
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new job posting.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="assessment">Required Assessment</Label>
                  <Select
                    value={newJob.selectedAssessment}
                    onValueChange={(value) => setNewJob({ ...newJob, selectedAssessment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {assessments.map((assessment) => (
                        <SelectItem key={assessment.id} value={assessment.id}>
                          {assessment.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="training">Required Training Module</Label>
                  <Select
                    value={newJob.selectedTrainingModule}
                    onValueChange={(value) => setNewJob({ ...newJob, selectedTrainingModule: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a training module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {trainingModules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateJob} className="mt-2">
                  Create Job
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>Created: {new Date(job.created_at || '').toLocaleDateString()}</CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteJob(job.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{job.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default JobManagement;
