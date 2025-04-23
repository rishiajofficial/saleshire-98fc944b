
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

  useEffect(() => {
    const fetchJobAssessment = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching assessment for job ID:", jobId);
        
        // Check if jobId is valid
        if (!jobId || jobId === 'undefined') {
          console.error("Invalid job ID provided:", jobId);
          setError("Cannot load assessment: Invalid job ID");
          setIsLoading(false);
          return;
        }
        
        // First check if this job has an assessment
        const { data: jobAssessment, error: jobAssessmentError } = await supabase
          .from('job_assessments')
          .select('assessment_id')
          .eq('job_id', jobId)
          .maybeSingle();
          
        if (jobAssessmentError) {
          console.error("Error fetching job assessment linkage:", jobAssessmentError);
          setError("Failed to check if job has an assessment.");
          setIsLoading(false);
          return;
        }
        
        console.log("Job assessment link data:", jobAssessment);
        
        // If there's no assessment linked to this job
        if (!jobAssessment) {
          console.log("No assessment linked to job ID:", jobId);
          setAssessment(null);
          setIsLoading(false);
          return;
        }
        
        // Now fetch the actual assessment details
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select('id, title, description, difficulty')
          .eq('id', jobAssessment.assessment_id)
          .single();
        
        if (assessmentError) {
          console.error("Error fetching assessment details:", assessmentError);
          setError("Failed to load assessment details.");
          setIsLoading(false);
          return;
        }
        
        console.log("Assessment data loaded:", assessmentData);
        setAssessment(assessmentData);
      } catch (error) {
        console.error("Error in fetchJobAssessment:", error);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobAssessment();
  }, [jobId]);
  
  const handleTakeAssessment = () => {
    // Redirect to assessment page with the right ID
    if (assessment?.id) {
      window.location.href = `/training/assessment/${assessment.id}`;
    } else {
      toast.error("Assessment not available");
    }
  };
  
  const handleComplete = () => {
    setIsSubmitting(true);
    
    // Here you would normally save the state of the application
    setTimeout(() => {
      setIsSubmitting(false);
      onComplete();
    }, 1000);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-3">Assessment</h2>
      
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
              <Button onClick={handleTakeAssessment}>
                Take Assessment
              </Button>
              <div className="text-xs text-gray-500 italic">
                Note: You can also complete the assessment later from your dashboard.
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertTitle>No Assessment Required</AlertTitle>
          <AlertDescription>
            This position doesn't require an assessment at this time. You can proceed with your application.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between mt-8">
        <Button onClick={onBack} variant="outline">Back</Button>
        <Button 
          onClick={handleComplete} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Complete Application
            </>
          ) : (
            "Complete Application"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ApplicationStepAssessment;
