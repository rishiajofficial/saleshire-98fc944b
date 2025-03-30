
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

const AssessmentResultDetails = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);

  useEffect(() => {
    if (resultId) {
      loadResultData();
    }
  }, [resultId]);

  const loadResultData = async () => {
    try {
      // Fetch the result
      const { data: resultData, error: resultError } = await supabase
        .from("assessment_results")
        .select(`
          *,
          candidate:profiles!assessment_results_candidate_id_fkey(id, name, email)
        `)
        .eq("id", resultId)
        .single();

      if (resultError) throw resultError;
      
      if (!resultData) {
        throw new Error("Result not found");
      }
      
      setResult(resultData);
      setFeedback(resultData.feedback || "");
      
      // Fetch the assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", resultData.assessment_id)
        .single();
        
      if (assessmentError) throw assessmentError;
      setAssessment(assessmentData);
      
      // Fetch sections and questions
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("assessment_sections")
        .select(`
          *,
          questions:questions(*)
        `)
        .eq("assessment_id", resultData.assessment_id)
        .order("created_at", { ascending: true });
      
      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);
      
      // Flatten questions for easier access
      const allQuestions: any[] = [];
      sectionsData?.forEach((section) => {
        section.questions?.forEach((question: any) => {
          allQuestions.push({
            ...question,
            section_title: section.title
          });
        });
      });
      
      setQuestions(allQuestions);
    } catch (error: any) {
      console.error("Error loading result data:", error.message);
      toast.error("Failed to load assessment result details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (!result) return;
    
    try {
      setSavingFeedback(true);
      
      const { error } = await supabase
        .from("assessment_results")
        .update({
          feedback,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", resultId);
        
      if (error) throw error;
      
      toast.success("Feedback saved successfully");
      setResult({
        ...result,
        feedback,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error saving feedback:", error.message);
      toast.error("Failed to save feedback");
    } finally {
      setSavingFeedback(false);
    }
  };

  const formatTimeSpent = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-lg text-muted-foreground">Loading assessment result details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!result || !assessment) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Result Not Found</h2>
          <p className="text-muted-foreground mb-6">The assessment result you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button asChild>
            <Link to="/assessments">Go to Assessments</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Calculate statistics
  const totalQuestions = questions.length;
  const answeredQuestions = result.answers ? Object.keys(result.answers).length : 0;
  const correctAnswers = questions.reduce((count, question) => {
    const userAnswer = result.answers?.[question.id];
    return userAnswer === question.correct_answer ? count + 1 : count;
  }, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Assessment Result
            </h1>
            <p className="text-muted-foreground mt-1">
              {assessment.title}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to={`/assessments/${assessment.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Assessment
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm text-muted-foreground">Name</h4>
                <p className="font-medium">{result.candidate?.name}</p>
              </div>
              <div>
                <h4 className="text-sm text-muted-foreground">Email</h4>
                <p className="font-medium">{result.candidate?.email}</p>
              </div>
              <div>
                <h4 className="text-sm text-muted-foreground">Started At</h4>
                <p className="font-medium">
                  {new Date(result.started_at).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm text-muted-foreground">Completed At</h4>
                <p className="font-medium">
                  {result.completed_at 
                    ? new Date(result.completed_at).toLocaleString() 
                    : "Not completed yet"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Assessment Results</CardTitle>
              <CardDescription>
                {result.completed ? "Assessment completed" : "Assessment in progress"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Score</p>
                  <p className="text-lg font-bold">
                    {result.score}% ({correctAnswers}/{totalQuestions})
                  </p>
                </div>
                <Progress value={result.score} className="h-2" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-xl font-bold">{totalQuestions}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Answered</p>
                  <p className="text-xl font-bold">{answeredQuestions}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Correct</p>
                  <p className="text-xl font-bold">{correctAnswers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Question Breakdown</CardTitle>
            <CardDescription>
              Detailed performance on individual questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                      Time Spent
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {questions.map((question) => {
                    const userAnswer = result.answers?.[question.id];
                    const isCorrect = userAnswer === question.correct_answer;
                    const timeSpent = result.answer_timings?.[question.id] || 0;
                    
                    return (
                      <tr key={question.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm">{question.text}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">{question.section_title}</div>
                        </td>
                        <td className="px-6 py-4">
                          {userAnswer !== undefined ? (
                            isCorrect ? (
                              <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                                <span className="text-sm">Correct</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <XCircle className="h-5 w-5 text-red-500 mr-1" />
                                <span className="text-sm">Incorrect</span>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center text-muted-foreground">
                              <span className="text-sm italic">Unanswered</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {timeSpent ? (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="text-sm">{formatTimeSpent(timeSpent)}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
            <CardDescription>
              Provide feedback on the candidate's assessment performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Enter feedback for this candidate..."
              className="min-h-[150px]"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            {result.reviewed_by && result.reviewed_at && (
              <p className="text-sm text-muted-foreground mt-2">
                Last reviewed on {new Date(result.reviewed_at).toLocaleString()}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleSaveFeedback}
              disabled={savingFeedback}
            >
              Save Feedback
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AssessmentResultDetails;
