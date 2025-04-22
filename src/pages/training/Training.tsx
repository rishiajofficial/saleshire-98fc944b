
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Book, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Training = () => {
  const { user } = useAuth();
  const [trainingModules, setTrainingModules] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch candidate's jobs
        const { data: candidateData, error: candidateError } = await supabase
          .from('candidates')
          .select('id')
          .eq('id', user.id)
          .single();
          
        if (candidateError || !candidateData) {
          console.error("Error fetching candidate data:", candidateError);
          return;
        }
        
        // For now, we'll use mock job data since we don't have a proper association table yet
        // In a real implementation, you would fetch from a candidate_jobs table or similar
        const mockJobs = [
          { id: "job-a", title: "Sales Executive" },
          { id: "job-b", title: "Business Development Associate" },
          { id: "job-c", title: "Field Sales Representative" },
        ];
        
        // In a real implementation, you would retrieve the job the candidate applied for
        setJobs(mockJobs);
        setSelectedJob(mockJobs[0]);
        
        // Fetch all training modules
        await fetchTrainingModules(mockJobs[0].id);
        
        // Fetch all assessments
        await fetchAssessments(mockJobs[0].id);
      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const fetchTrainingModules = async (jobId: string) => {
    try {
      // Fetch training modules associated with the job
      const { data: jobTrainingData, error: jobTrainingError } = await supabase
        .from('job_training')
        .select(`
          training_modules:training_module_id (
            id,
            title,
            description,
            module,
            video_url,
            content
          )
        `)
        .eq('job_id', jobId);
        
      if (jobTrainingError) {
        console.error("Error fetching job training modules:", jobTrainingError);
        return;
      }
      
      if (jobTrainingData && jobTrainingData.length > 0) {
        const modules = jobTrainingData
          .map(item => item.training_modules)
          .filter(Boolean);
          
        setTrainingModules(modules);
      } else {
        // Fallback to fetch all training modules if no job-specific ones are found
        const { data: allModules, error: modulesError } = await supabase
          .from('training_modules')
          .select('*')
          .order('module');
          
        if (modulesError) {
          console.error("Error fetching all training modules:", modulesError);
          return;
        }
        
        setTrainingModules(allModules || []);
      }
    } catch (error) {
      console.error("Error in fetchTrainingModules:", error);
    }
  };
  
  const fetchAssessments = async (jobId: string) => {
    try {
      // Fetch assessments associated with the job
      const { data: jobAssessmentData, error: jobAssessmentError } = await supabase
        .from('job_assessments')
        .select(`
          assessments:assessment_id (
            id,
            title,
            description,
            difficulty
          )
        `)
        .eq('job_id', jobId);
        
      if (jobAssessmentError) {
        console.error("Error fetching job assessments:", jobAssessmentError);
        return;
      }
      
      if (jobAssessmentData && jobAssessmentData.length > 0) {
        const assessments = jobAssessmentData
          .map(item => item.assessments)
          .filter(Boolean);
          
        setAssessments(assessments);
      } else {
        // Fallback to fetch all assessments if no job-specific ones are found
        const { data: allAssessments, error: assessmentsError } = await supabase
          .from('assessments')
          .select('*');
          
        if (assessmentsError) {
          console.error("Error fetching all assessments:", assessmentsError);
          return;
        }
        
        setAssessments(allAssessments || []);
      }
    } catch (error) {
      console.error("Error in fetchAssessments:", error);
    }
  };
  
  const handleJobChange = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setIsLoading(true);
      await fetchTrainingModules(jobId);
      await fetchAssessments(jobId);
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Training Center</h1>
        
        {jobs.length > 1 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Select Job</h2>
            <div className="flex flex-wrap gap-2">
              {jobs.map(job => (
                <Button
                  key={job.id}
                  variant={selectedJob?.id === job.id ? "default" : "outline"}
                  onClick={() => handleJobChange(job.id)}
                  className="text-sm"
                >
                  {job.title}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {selectedJob && (
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h2 className="font-semibold text-blue-800">Training for: {selectedJob.title}</h2>
            <p className="text-sm text-gray-600">
              Complete the following training modules and assessments.
            </p>
          </div>
        )}
        
        <Tabs defaultValue="modules">
          <TabsList className="mb-4">
            <TabsTrigger value="modules" className="flex items-center">
              <Book className="h-4 w-4 mr-2" />
              Training Modules
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Assessments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : trainingModules.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No training modules available for this job.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainingModules.map((module) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Book className="h-5 w-5 mr-2 text-primary" />
                        {module.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {module.description || "No description available."}
                      </p>
                      <Button asChild className="w-full">
                        <Link to={`/training/module/${module.id}`}>
                          Start Module
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="assessments">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No assessments available for this job.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assessments.map((assessment) => (
                  <Card key={assessment.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        {assessment.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">
                        {assessment.description || "No description available."}
                      </p>
                      <p className="text-xs font-medium mb-4">
                        Difficulty: {assessment.difficulty || "Not specified"}
                      </p>
                      <Button asChild className="w-full">
                        <Link to={`/training/assessment/${assessment.id}`}>
                          Take Assessment
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Training;
