
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, Calendar, Book } from "lucide-react";
import { Job } from "@/types/job";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["active", "inactive"]),
});

const JobManagement = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [trainingModules, setTrainingModules] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAssociationDialogOpen, setIsAssociationDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [selectedTrainingModules, setSelectedTrainingModules] = useState<string[]>([]);
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "active",
    },
  });

  useEffect(() => {
    fetchJobs();
    fetchAssessments();
    fetchTrainingModules();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("id, title");
        
      if (error) throw error;
      
      setAssessments(data || []);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  };

  const fetchTrainingModules = async () => {
    try {
      const { data, error } = await supabase
        .from("training_modules")
        .select("id, title");
        
      if (error) throw error;
      
      setTrainingModules(data || []);
    } catch (error) {
      console.error("Error fetching training modules:", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          title: values.title,
          description: values.description,
          status: values.status,
          created_by: user.id,
        })
        .select();
        
      if (error) throw error;
      
      toast.success("Job created successfully");
      setIsDialogOpen(false);
      form.reset();
      fetchJobs();
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job");
    }
  };

  const handleDelete = async (jobId: string) => {
    try {
      // Delete job associations first
      await supabase.from("job_assessments").delete().eq("job_id", jobId);
      await supabase.from("job_training").delete().eq("job_id", jobId);
      
      // Then delete job
      const { error } = await supabase.from("jobs").delete().eq("id", jobId);
      
      if (error) throw error;
      
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
    }
  };

  const openAssociationDialog = async (job: Job) => {
    setSelectedJob(job);
    
    try {
      // Fetch current job assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from("job_assessments")
        .select("assessment_id")
        .eq("job_id", job.id)
        .single();
        
      if (!assessmentError && assessmentData) {
        setSelectedAssessment(assessmentData.assessment_id);
      } else {
        setSelectedAssessment(null);
      }
      
      // Fetch current job training modules
      const { data: trainingData, error: trainingError } = await supabase
        .from("job_training")
        .select("training_module_id")
        .eq("job_id", job.id);
        
      if (!trainingError && trainingData) {
        setSelectedTrainingModules(trainingData.map(item => item.training_module_id));
      } else {
        setSelectedTrainingModules([]);
      }
      
      setIsAssociationDialogOpen(true);
    } catch (error) {
      console.error("Error fetching job associations:", error);
      toast.error("Failed to load job associations");
    }
  };

  const handleSaveAssociations = async () => {
    if (!selectedJob) return;
    
    try {
      // Update assessment association
      if (selectedAssessment) {
        // Delete existing assessment association
        await supabase
          .from("job_assessments")
          .delete()
          .eq("job_id", selectedJob.id);
          
        // Insert new assessment association
        const { error: insertError } = await supabase
          .from("job_assessments")
          .insert({
            job_id: selectedJob.id,
            assessment_id: selectedAssessment
          });
          
        if (insertError) throw insertError;
      }
      
      // Update training module associations
      if (selectedTrainingModules.length > 0) {
        // Delete existing training module associations
        await supabase
          .from("job_training")
          .delete()
          .eq("job_id", selectedJob.id);
          
        // Insert new training module associations
        const trainingInserts = selectedTrainingModules.map(moduleId => ({
          job_id: selectedJob.id,
          training_module_id: moduleId
        }));
        
        const { error: trainingError } = await supabase
          .from("job_training")
          .insert(trainingInserts);
          
        if (trainingError) throw trainingError;
      }
      
      toast.success("Job associations updated successfully");
      setIsAssociationDialogOpen(false);
      fetchJobs();
    } catch (error) {
      console.error("Error updating job associations:", error);
      toast.error("Failed to update job associations");
    }
  };

  const handleTrainingModuleToggle = (moduleId: string) => {
    setSelectedTrainingModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Job Management</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  Add a new job opening to the platform.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Sales Executive" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the job role and responsibilities"
                            {...field}
                            className="min-h-[120px]"
                          />
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
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">Create Job</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </CardFooter>
              </Card>
            ))
          ) : jobs.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No jobs found. Create your first job posting.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>
                        Status: <span className={job.status === "active" ? "text-green-600" : "text-red-600"}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </CardDescription>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the job posting and remove it from the system.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(job.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => openAssociationDialog(job)}
                  >
                    Associate Content
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
        
        {selectedJob && (
          <Dialog open={isAssociationDialogOpen} onOpenChange={setIsAssociationDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Associate Content with {selectedJob.title}</DialogTitle>
                <DialogDescription>
                  Link assessments and training modules to this job posting.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div>
                  <h3 className="text-sm font-medium flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Assessment
                  </h3>
                  <Select 
                    value={selectedAssessment || ""} 
                    onValueChange={setSelectedAssessment}
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
                  <h3 className="text-sm font-medium flex items-center mb-2">
                    <Book className="h-4 w-4 mr-2" />
                    Training Modules
                  </h3>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                    {trainingModules.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">
                        No training modules available
                      </p>
                    ) : (
                      trainingModules.map((module) => (
                        <div 
                          key={module.id} 
                          className="flex items-center p-2 hover:bg-gray-50 rounded"
                        >
                          <input
                            type="checkbox"
                            id={`module-${module.id}`}
                            checked={selectedTrainingModules.includes(module.id)}
                            onChange={() => handleTrainingModuleToggle(module.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor={`module-${module.id}`}
                            className="ml-2 text-sm cursor-pointer w-full"
                          >
                            {module.title}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  onClick={handleSaveAssociations}
                  className="w-full"
                >
                  Save Associations
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default JobManagement;
