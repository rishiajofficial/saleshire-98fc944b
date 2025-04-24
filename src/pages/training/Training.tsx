
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Book, Calendar, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from '@/components/layout/MainLayout';

const Training = () => {
  const { user } = useAuth();
  const [trainingModules, setTrainingModules] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [trainingCategories, setTrainingCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    
    const checkAccessAndFetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get candidate status
        const { data: candidateData, error: candidateError } = await supabase
          .from('candidates')
          .select('status, current_step')
          .eq('id', user.id)
          .single();
          
        if (candidateError) throw candidateError;
        
        // Check if candidate has access to training (after HR review)
        const hasTrainingAccess = candidateData.status === 'hr_approved' || 
                                 candidateData.current_step >= 3;
        setHasAccess(hasTrainingAccess);
        
        // Get selected job from localStorage
        const selectedJobId = localStorage.getItem("selectedJob");
        if (!selectedJobId) return;
        
        // Get job data
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', selectedJobId)
          .single();
          
        if (jobError) throw jobError;
        setSelectedJob(jobData);
        
        // Fetch training categories
        const { data: categories, error: categoriesError } = await supabase
          .from('training_categories')
          .select('*')
          .order('name');
        
        if (categoriesError) throw categoriesError;
        setTrainingCategories(categories || []);
        
        if (hasTrainingAccess) {
          await fetchTrainingModules(selectedJobId);
          await fetchAssessments(selectedJobId);
        }
      } catch (error) {
        console.error("Error in checkAccessAndFetchData:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccessAndFetchData();
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
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };
  
  // Filter training modules by category
  const filteredModules = selectedCategory === 'all' 
    ? trainingModules 
    : trainingModules.filter(module => module.module === selectedCategory);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!hasAccess) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <Lock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4">Training Content Locked</h2>
          <p className="text-gray-600 mb-6">
            Training modules will be available after your application is reviewed by HR.
          </p>
        </div>
      </MainLayout>
    );
  }

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
            {trainingCategories.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-2">Filter by Category</h2>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? "default" : "outline"}
                    onClick={() => handleCategoryChange('all')}
                    className="text-sm"
                  >
                    All Categories
                  </Button>
                  {trainingCategories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.name ? "default" : "outline"}
                      onClick={() => handleCategoryChange(category.name)}
                      className="text-sm"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredModules.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No training modules available for this job or category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map((module) => (
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
