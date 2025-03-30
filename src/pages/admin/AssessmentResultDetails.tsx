
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Loader2, User, CheckCircle, X, Clock, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AssessmentResultDetails = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Load result data
  useEffect(() => {
    const loadResult = async () => {
      setLoading(true);
      setLoadingError(null);
      
      try {
        if (!resultId) {
          setLoadingError("Result ID is missing");
          return;
        }
        
        // Fetch result with related data
        const { data: resultData, error: resultError } = await supabase
          .from("assessment_results")
          .select(`
            *,
            assessments:assessment_id(*),
            candidates:candidate_id(*, profiles:id(*))
          `)
          .eq("id", resultId)
          .single();
        
        if (resultError) {
          throw resultError;
        }
        
        if (!resultData) {
          setLoadingError("Assessment result not found");
          return;
        }
        
        setResult(resultData);
        setAssessment(resultData.assessments);
        setCandidate(resultData.candidates);
      } catch (error: any) {
        console.error("Error loading assessment result:", error.message);
        setLoadingError(`Failed to load assessment result: ${error.message}`);
        toast.error("Failed to load assessment result data");
      } finally {
        setLoading(false);
      }
    };
    
    loadResult();
  }, [resultId]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate time taken
  const calculateTimeTaken = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return "N/A";
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    
    // Convert to minutes and seconds
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading assessment result...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loadingError) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center space-y-4 max-w-md text-center">
            <div className="p-3 rounded-full bg-red-50">
              <div className="rounded-full bg-red-100 p-2">
                <FileCheck className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold">Result Not Found</h2>
            <p className="text-muted-foreground">
              {loadingError}
            </p>
            <Button asChild>
              <Link to="/assessments">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assessments
              </Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assessment Result</h1>
            <p className="text-muted-foreground mt-2">
              Detailed view of candidate assessment performance
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to={`/assessments/${assessment?.id || ''}`}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Assessment
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
              <CardDescription>
                Details about the candidate who took this assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {candidate?.profiles?.name || "Unknown Candidate"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {candidate?.profiles?.email || "No email available"}
                    </p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Region</h4>
                  <Badge variant="outline">{candidate?.region || "Not specified"}</Badge>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Status</h4>
                  <Badge
                    className={
                      candidate?.status === "hired"
                        ? "bg-green-100 text-green-800"
                        : candidate?.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {(candidate?.status || "applied").charAt(0).toUpperCase() +
                      (candidate?.status || "applied").slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Assessment Overview</CardTitle>
              <CardDescription>
                Summary of the assessment and result
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{assessment?.title || "Unknown Assessment"}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {assessment?.description || "No description available"}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className={`h-4 w-4 ${result?.completed ? "text-green-500" : "text-muted-foreground"}`} />
                      <h4 className="font-medium">Completion Status</h4>
                    </div>
                    <p className="text-sm">
                      {result?.completed ? "Completed" : "Not completed"}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Time Taken</h4>
                    </div>
                    <p className="text-sm">
                      {calculateTimeTaken(result?.started_at, result?.completed_at)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileCheck className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Score</h4>
                    </div>
                    <p className="text-sm font-semibold">
                      {result?.score !== null ? `${result.score}%` : "Not scored"}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Reviewed By</h4>
                    </div>
                    <p className="text-sm">
                      {result?.reviewed_by ? "Yes" : "Not reviewed yet"}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Assessment Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Started at:</span>
                      <span className="text-sm">{formatDate(result?.started_at)}</span>
                    </div>
                    {result?.completed_at && (
                      <div className="flex justify-between">
                        <span className="text-sm">Completed at:</span>
                        <span className="text-sm">{formatDate(result?.completed_at)}</span>
                      </div>
                    )}
                    {result?.reviewed_at && (
                      <div className="flex justify-between">
                        <span className="text-sm">Reviewed at:</span>
                        <span className="text-sm">{formatDate(result?.reviewed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Result Details</CardTitle>
            <CardDescription>
              Detailed breakdown of answers and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result?.answers ? (
              <div className="space-y-6">
                {Array.isArray(result.answers) ? (
                  result.answers.map((answer: any, index: number) => (
                    <div key={index} className="border p-4 rounded-md">
                      <h4 className="font-medium mb-2">Question {index + 1}</h4>
                      <div className="space-y-2">
                        <p className="text-sm">{answer.question}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Selected answer:</span>
                          <span className="text-sm">Option {answer.selected + 1}</span>
                          {answer.correct !== undefined && (
                            answer.correct ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )
                          )}
                        </div>
                        {answer.time_taken && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Time taken:</span>
                            <span className="text-sm">{answer.time_taken} seconds</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Answer data is not in the expected format.</p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No detailed answer data available for this attempt.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {result?.feedback && (
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
              <CardDescription>
                Reviewer feedback for this assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{result.feedback}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default AssessmentResultDetails;
