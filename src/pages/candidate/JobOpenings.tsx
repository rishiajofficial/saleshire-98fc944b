
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import MainLayout from '@/components/layout/MainLayout';
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const JobOpenings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userApplications, setUserApplications] = useState<Record<string, boolean>>({});
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: jobs, isLoading, error, refetch } = useQuery({
    queryKey: ['active-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const fetchUserApplications = async () => {
      if (!user) return;
      
      try {
        setLoadingApplications(true);
        const { data, error } = await supabase
          .from('job_applications')
          .select('job_id, status')
          .eq('candidate_id', user.id);
          
        if (error) throw error;
        
        const applications: Record<string, boolean> = {};
        if (data) {
          data.forEach(app => {
            applications[app.job_id] = true;
          });
        }
        
        setUserApplications(applications);
      } catch (err) {
        console.error("Error fetching user applications:", err);
      } finally {
        setLoadingApplications(false);
      }
    };
    
    fetchUserApplications();
  }, [user]);

  const handleApply = async (jobId: string) => {
    try {
      // Store the selected job ID
      localStorage.setItem("selectedJob", jobId);
      navigate("/application");
    } catch (error) {
      console.error("Error applying for job:", error);
      toast.error("Failed to apply for job");
    }
  };

  const handleDeleteApplication = async () => {
    if (!user || !jobToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // First, get the training modules associated with this job
      const { data: jobTrainingData, error: jobTrainingError } = await supabase
        .from('job_training')
        .select('training_module_id')
        .eq('job_id', jobToDelete);
        
      if (jobTrainingError) throw jobTrainingError;
      
      // Delete the job application
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('candidate_id', user.id)
        .eq('job_id', jobToDelete);
        
      if (error) throw error;
      
      // Clear training progress for modules associated with this job
      if (jobTrainingData && jobTrainingData.length > 0) {
        const moduleIds = jobTrainingData.map(jt => jt.training_module_id);
        
        // Get videos for these modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('training_modules')
          .select('id, module')
          .in('id', moduleIds);
          
        if (modulesError) throw modulesError;
        
        if (modulesData && modulesData.length > 0) {
          // Get list of module categories
          const moduleCategories = modulesData.map(m => m.module);
          
          // Delete training progress for these modules
          if (moduleCategories.length > 0) {
            const { error: progressError } = await supabase
              .from('training_progress')
              .delete()
              .eq('user_id', user.id)
              .in('module', moduleCategories);
              
            if (progressError) throw progressError;
          }
          
          // Delete quiz results for these modules
          const { error: quizError } = await supabase
            .from('quiz_results')
            .delete()
            .eq('user_id', user.id)
            .in('module', moduleCategories);
            
          if (quizError) throw quizError;
        }
      }
      
      toast.success("Application successfully withdrawn");
      
      // Update local state
      setUserApplications(prev => {
        const updated = {...prev};
        delete updated[jobToDelete];
        return updated;
      });
      
      setJobToDelete(null);
    } catch (err: any) {
      console.error("Error deleting application:", err);
      toast.error("Failed to withdraw application: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || loadingApplications) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12">
          <div className="text-center text-red-600">
            Failed to load job openings. Please try again later.
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8">Job Openings</h2>
        {jobs && jobs.length > 0 ? (
          <div className="space-y-6">
            {jobs.map((job) => {
              const hasApplied = userApplications[job.id];
              
              return (
                <Card key={job.id} className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-lg">{job.title}</div>
                      <div className="text-gray-600 text-sm">{job.description}</div>
                      {job.location && (
                        <div className="text-gray-500 text-xs mt-1">Location: {job.location}</div>
                      )}
                      {job.salary_range && (
                        <div className="text-gray-500 text-xs">Salary: {job.salary_range}</div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {hasApplied ? (
                        <>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" /> Applied
                          </Badge>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            onClick={() => setJobToDelete(job.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Withdraw
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => handleApply(job.id)}>
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No job openings available at the moment.
          </div>
        )}
      </div>
      
      <AlertDialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw your application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteApplication}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                'Withdraw Application'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default JobOpenings;
