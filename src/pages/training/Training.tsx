
import React, { useEffect, useState } from "react";
import { Loader2, Lock, BookOpen, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from '@/components/layout/MainLayout';
import TrainingHeader from "@/components/training/TrainingHeader";
import VideoSection from "@/components/training/VideoSection";
import AssessmentSection from "@/components/training/AssessmentSection";
import { toast } from "sonner";
import { useTrainingModulesList } from "@/hooks/training/useTrainingModulesList";
import { TrainingModuleProgress } from "@/types/training";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Training = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasAssessmentAccess, setHasAssessmentAccess] = useState(false);
  const [hasTrainingAccess, setHasTrainingAccess] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  
  const { modules: trainingModules, loading: isLoadingModules, error } = useTrainingModulesList();

  useEffect(() => {
    if (!user) return;
    
    const checkAccessAndFetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get candidate data and most recent job application
        const { data: candidateData, error: candidateError } = await supabase
          .from('candidates')
          .select('status, current_step')
          .eq('id', user.id)
          .single();
          
        if (candidateError) {
          console.error("Error fetching candidate data:", candidateError);
          if (candidateError.code !== 'PGRST116') {
            toast.error("Failed to check training access");
          }
          return;
        }
        
        const step = candidateData.current_step || 1;
        setCurrentStep(step);
        
        // Assessment access: available from step 2 onwards (after application completion)
        const assessmentAccess = step >= 2;
        setHasAssessmentAccess(assessmentAccess);
        
        // Training access: available when HR approved or step 3+
        const trainingAccess = candidateData.status === 'hr_approved' || 
                              candidateData.status === 'training' ||
                              step >= 3;
        setHasTrainingAccess(trainingAccess);
        
        // Get the most recent job application
        const { data: jobApplicationData, error: jobAppError } = await supabase
          .from('job_applications')
          .select('job_id')
          .eq('candidate_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (!jobAppError && jobApplicationData && jobApplicationData.length > 0) {
          const jobId = jobApplicationData[0]?.job_id;
          
          if (jobId) {
            const { data: jobData, error: jobError } = await supabase
              .from('jobs')
              .select('*')
              .eq('id', jobId)
              .single();
              
            if (!jobError && jobData) {
              setSelectedJob(jobData);
            }
          }
        }
      } catch (error: any) {
        console.error("Error in checkAccessAndFetchData:", error);
        toast.error("Failed to load training data");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccessAndFetchData();
  }, [user]);

  useEffect(() => {
    if (trainingModules.length > 0 && !selectedModuleId) {
      // Find the first unlocked module
      const firstUnlockedModule = trainingModules.find(m => !m.locked);
      if (firstUnlockedModule) {
        setSelectedModuleId(firstUnlockedModule.id);
      } else {
        setSelectedModuleId(trainingModules[0].id);
      }
    }
  }, [trainingModules, selectedModuleId]);

  const handleModuleChange = (moduleId: string) => {
    setSelectedModuleId(moduleId);
  };

  const isPageLoading = isLoading || isLoadingModules;

  if (isPageLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Training</h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </MainLayout>
    );
  }

  // If no access to either assessment or training
  if (!hasAssessmentAccess && !hasTrainingAccess) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <Lock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4">Content Locked</h2>
          <p className="text-gray-600 mb-6">
            Complete your application first to access assessments and training modules.
          </p>
        </div>
      </MainLayout>
    );
  }

  const selectedModule = trainingModules.find(m => m.id === selectedModuleId) || trainingModules[0];

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <TrainingHeader jobTitle={selectedJob?.title} />
        
        <Tabs defaultValue={hasAssessmentAccess && currentStep === 2 ? "assessment" : "training"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="assessment" 
              disabled={!hasAssessmentAccess}
              className="flex items-center gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              Assessment
              {!hasAssessmentAccess && <Lock className="h-3 w-3" />}
            </TabsTrigger>
            <TabsTrigger 
              value="training" 
              disabled={!hasTrainingAccess}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Training
              {!hasTrainingAccess && <Lock className="h-3 w-3" />}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="assessment" className="space-y-6">
            {hasAssessmentAccess ? (
              <Card>
                <CardHeader>
                  <CardTitle>Skills Assessment</CardTitle>
                  <CardDescription>
                    Complete this assessment to demonstrate your knowledge and unlock training modules.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AssessmentSection 
                    quizzes={[{
                      id: "assessment-1",
                      title: "Initial Skills Assessment",
                      description: "Complete this assessment to test your knowledge and unlock training content",
                      difficulty: "Standard"
                    }]}
                    moduleId="assessment" 
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Assessment Locked</h3>
                  <p className="text-gray-600">Complete your application to access the assessment.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="training" className="space-y-6">
            {hasTrainingAccess ? (
              <>
                {trainingModules.length > 0 ? (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold mb-4">Training Modules</h2>
                      <div className="flex overflow-x-auto gap-2 pb-2">
                        {trainingModules.map((module) => (
                          <Button
                            key={module.id}
                            variant={selectedModuleId === module.id ? "default" : "outline"}
                            onClick={() => !module.locked && handleModuleChange(module.id)}
                            disabled={module.locked}
                            className={`whitespace-nowrap ${module.locked ? 'opacity-60' : ''}`}
                          >
                            {module.locked && <Lock className="mr-1 h-3 w-3" />}
                            {module.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {selectedModule && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-xl font-bold mb-4">{selectedModule.title}</h2>
                          {selectedModule.description && (
                            <p className="text-gray-600 mb-6">{selectedModule.description}</p>
                          )}
                          <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1">
                              <Progress value={selectedModule.progress} className="h-2" />
                            </div>
                            <div className="text-sm font-medium">
                              {selectedModule.progress}% Complete
                            </div>
                          </div>
                        </div>
                        
                        <VideoSection 
                          videos={selectedModule.videos} 
                          moduleId={selectedModule.id}
                        />
                        
                        <AssessmentSection 
                          quizzes={selectedModule.quizIds?.map(id => ({ 
                            id,
                            title: `Assessment for ${selectedModule.title}`,
                            description: `Complete this assessment to test your knowledge of ${selectedModule.title}`,
                            difficulty: "Standard"
                          })) || []}
                          moduleId={selectedModule.id} 
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No training content available for your current job application. Please check back later.</p>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Training Locked</h3>
                  <p className="text-gray-600">
                    Complete the assessment with a score of 50% or higher to unlock training modules.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Training;
