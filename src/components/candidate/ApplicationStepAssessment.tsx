
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ApplicationStepAssessmentProps {
  onBack: () => void;
  onComplete: () => void;
  jobId: string;
}

const ApplicationStepAssessment = ({ onBack, onComplete, jobId }: ApplicationStepAssessmentProps) => {
  const [assessment, setAssessment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    const checkExistingApplication = async () => {
      try {
        const { data: existingApplication, error: applicationError } = await supabase
          .from('job_applications')
          .select('*')
          .eq('job_id', jobId)
          .eq('candidate_id', (await supabase.auth.getUser()).data.user?.id)
          .maybeSingle();

        if (applicationError) throw applicationError;
        setHasExistingApplication(!!existingApplication);
      } catch (error) {
        console.error("Error checking existing application:", error);
      }
    };

    const fetchJobAssessment = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if jobId is valid
        if (!jobId || jobId === 'undefined') {
          setError("Cannot load assessment: Invalid job ID");
          return;
        }
        
        // First check if this job has an assessment
        const { data: jobAssessment, error: jobAssessmentError } = await supabase
          .from('job_assessments')
          .select('assessment_id')
          .eq('job_id', jobId)
          .maybeSingle();
          
        if (jobAssessmentError) throw jobAssessmentError;
        
        // If there's no assessment linked to this job
        if (!jobAssessment) {
          setAssessment(null);
          // If no assessment is required, we can auto-complete
          setHasCompletedAssessment(true);
          return;
        }
        
        // Now fetch the actual assessment details
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select('id, title, description, difficulty')
          .eq('id', jobAssessment.assessment_id)
          .single();
        
        if (assessmentError) throw assessmentError;
        setAssessment(assessmentData);
        
        // Check if user has already completed this assessment
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (userId) {
          const { data: results, error: resultsError } = await supabase
            .from('assessment_results')
            .select('*')
            .eq('candidate_id', userId)
            .eq('assessment_id', jobAssessment.assessment_id)
            .maybeSingle();
            
          if (!resultsError && results) {
            setHasCompletedAssessment(true);
          }
        }
      } catch (error: any) {
        console.error("Error in fetchJobAssessment:", error);
        setError("Failed to load assessment details.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkExistingApplication();
    fetchJobAssessment();
  }, [jobId]);
  
  const handleTakeAssessment = () => {
    if (assessment?.id) {
      window.location.href = `/training/assessment/${assessment.id}`;
    } else {
      toast.error("Assessment not available");
    }
  };
  
  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // First check for existing application again
      const { data: existingApplication } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', jobId)
        .eq('candidate_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (existingApplication) {
        toast.error("You have already applied for this position");
        return;
      }

      // Create job application
      const { error: applicationError } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          candidate_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'applied'
        });

      if (applicationError) throw applicationError;

      // Update candidate status
      const { error: candidateError } = await supabase
        .from('candidates')
        .update({ 
          status: 'screening',
          current_step: 2 // Move to HR Review step
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (candidateError) throw candidateError;

      toast.success("Application submitted successfully!");
      onComplete();
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasExistingApplication) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Already Applied</AlertTitle>
        <AlertDescription>
          You have already submitted an application for this position.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-3">Initial Screening Assessment</h2>
      <p className="text-muted-foreground mb-4">
        This is an initial screening assessment to evaluate your basic qualifications. 
        Additional training and assessments will be provided after HR review.
      </p>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : assessment ? (
        <Card>
          <CardHeader>
            <CardTitle>{assessment.title}</CardTitle>
            <CardDescription>
              Difficulty: {assessment.difficulty || "Not specified"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-700">
              {assessment.description}
            </div>
            <div className="flex flex-col gap-4 mt-4">
              {hasCompletedAssessment ? (
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                  <p className="text-green-700 font-medium">Assessment Completed!</p>
                  <p className="text-sm text-green-600 mt-1">
                    You've already completed this assessment. Please click submit to continue.
                  </p>
                  <Button onClick={handleComplete} className="mt-4" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  <Button onClick={handleTakeAssessment}>
                    Take Assessment
                  </Button>
                  <div className="text-xs text-gray-500 italic">
                    You must complete the assessment before your application can be submitted.
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertTitle>No Assessment Required</AlertTitle>
          <AlertDescription>
            This position doesn't require an initial screening assessment.
          </AlertDescription>
          <Button onClick={handleComplete} className="mt-4" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </Alert>
      )}
      
      <div className="flex justify-between mt-8">
        <Button onClick={onBack} variant="outline">Back</Button>
      </div>
    </div>
  );
};

export default ApplicationStepAssessment;
