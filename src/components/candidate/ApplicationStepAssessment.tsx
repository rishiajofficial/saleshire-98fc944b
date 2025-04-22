
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

  useEffect(() => {
    const fetchJobAssessment = async () => {
      try {
        setIsLoading(true);
        
        // Fetch assessment associated with the job
        const { data, error } = await supabase
          .from('job_assessments')
          .select(`
            assessments:assessment_id (
              id,
              title,
              description,
              difficulty
            )
          `)
          .eq('job_id', jobId)
          .single();
          
        if (error) {
          console.error("Error fetching job assessment:", error);
          return;
        }
        
        if (data?.assessments) {
          setAssessment(data.assessments);
        }
      } catch (error) {
        console.error("Error in fetchJobAssessment:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (jobId) {
      fetchJobAssessment();
    }
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
              Submitting...
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
