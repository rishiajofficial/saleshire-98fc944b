
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, AlertCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const TrainingQuiz = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Fetch candidate data to get current_step
  const { data: candidateData } = useQuery({
    queryKey: ['candidate-data', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user ID available");
      
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch module data
  const { data: module, isLoading: isLoadingModule } = useQuery({
    queryKey: ['training-module', moduleId],
    queryFn: async () => {
      if (!moduleId) throw new Error("No module ID provided");
      
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .eq('module', moduleId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!moduleId
  });

  // Fetch quiz data using the module's quiz_id
  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ['quiz', module?.quiz_id],
    queryFn: async () => {
      if (!module?.quiz_id) throw new Error("No quiz ID found for this module");
      
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', module.quiz_id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!module?.quiz_id
  });

  // Fetch quiz sections
  const { data: quizSections, isLoading: isLoadingQuizSections } = useQuery({
    queryKey: ['quiz-sections', quiz?.id],
    queryFn: async () => {
      if (!quiz?.id) throw new Error("No quiz ID available");
      
      const { data, error } = await supabase
        .from('assessment_sections')
        .select('*')
        .eq('assessment_id', quiz.id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!quiz?.id
  });

  // Fetch questions - handle the type safety properly
  const { data: allQuestions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['quiz-questions', quizSections?.length > 0 ? quizSections.map(s => s.id).join(',') : ''],
    queryFn: async () => {
      if (!quizSections || quizSections.length === 0) throw new Error("No sections available");
      
      const sectionIds = quizSections.map(section => section.id);
      
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .in('section_id', sectionIds);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!(quizSections && quizSections.length > 0)
  });

  // Flatten all questions into one array for simplicity
  const questions = allQuestions || [];

  useEffect(() => {
    // Start quiz timer when component mounts and questions are loaded
    if (questions.length > 0 && !quizStartTime) {
      setQuizStartTime(new Date());
    }
  }, [questions, quizStartTime]);

  // Check if the user has already taken this quiz
  const { data: existingResult, isLoading: isLoadingResult } = useQuery({
    queryKey: ['quiz-result', user?.id, module?.quiz_id],
    queryFn: async () => {
      if (!user?.id || !module?.quiz_id) throw new Error("User or quiz ID not available");
      
      const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('candidate_id', user.id)
        .eq('assessment_id', module.quiz_id)
        .eq('completed', true)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!(user?.id && module?.quiz_id)
  });

  // Check if there's an existing result and update the state
  useEffect(() => {
    if (existingResult && !quizCompleted) {
      setQuizCompleted(true);
      setScore(existingResult.score);
    }
  }, [existingResult]);

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers({
      ...answers,
      [questionIndex]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = (): number => {
    if (!questions.length) return 0;
    
    let correctAnswers = 0;
    
    Object.entries(answers).forEach(([questionIdx, selectedOption]) => {
      const question = questions[parseInt(questionIdx)];
      if (question && question.correct_answer === selectedOption) {
        correctAnswers++;
      }
    });
    
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const handleSubmitQuiz = async () => {
    if (!user?.id || !module?.quiz_id) return;
    
    try {
      setIsSubmitting(true);
      
      // Calculate quiz duration
      const endTime = new Date();
      const duration = quizStartTime ? Math.floor((endTime.getTime() - quizStartTime.getTime()) / 1000) : 0;
      
      // Calculate score
      const finalScore = calculateScore();
      setScore(finalScore);
      
      // Prepare answer data
      const formattedAnswers = Object.entries(answers).reduce((acc: Record<string, number>, [qIdx, answer]) => {
        const questionId = questions[parseInt(qIdx)]?.id;
        if (questionId) {
          acc[questionId] = answer;
        }
        return acc;
      }, {});
      
      // Save quiz results to database
      const { data, error } = await supabase
        .from('assessment_results')
        .insert({
          candidate_id: user.id,
          assessment_id: module.quiz_id,
          score: finalScore,
          answers: formattedAnswers,
          completed: true,
          completed_at: new Date().toISOString(),
          answer_timings: { total_seconds: duration }
        })
        .select();
      
      if (error) throw error;
      
      // Update candidate step if passed
      if (finalScore >= 70) {
        let nextStep = 3; // Default
        if (module.module === 'product') nextStep = 3;
        else if (module.module === 'sales') nextStep = 4;
        else if (module.module === 'customer-service') nextStep = 5;
        
        // Use candidateData from the query instead of accessing user.candidateData
        const { error: updateError } = await supabase
          .from('candidates')
          .update({
            current_step: Math.max(nextStep, candidateData?.current_step || 3)
          })
          .eq('id', user.id);
          
        if (updateError) console.error("Error updating candidate step:", updateError);
      }
      
      setQuizCompleted(true);
      toast.success(`Quiz completed! Your score: ${finalScore}%`);
      
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingModule || isLoadingQuiz || isLoadingQuizSections || isLoadingQuestions || isLoadingResult;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!module || !questions.length) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Training Quiz</h1>
              <p className="text-muted-foreground mt-2">
                The requested quiz could not be found
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/training")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Training
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Quiz Not Available</h2>
                <p className="text-muted-foreground">
                  This quiz is not available at the moment. Please try again later or contact support.
                </p>
                <Button className="mt-6" onClick={() => navigate("/training")}>
                  Return to Training Center
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const hasAnsweredCurrent = answers[currentQuestionIndex] !== undefined;

  // If quiz is completed, show results
  if (quizCompleted && score !== null) {
    const isPassing = score >= 70;
    
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quiz Results</h1>
              <p className="text-muted-foreground mt-2">
                {module.title || "Training Module Quiz"}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/training")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Training
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                {isPassing ? (
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                )}
                <h2 className="text-2xl font-bold mb-2">
                  {isPassing ? "Congratulations!" : "Need Some Review"}
                </h2>
                <div className="text-5xl font-bold mb-6 mt-4">
                  <span className={isPassing ? "text-green-500" : "text-amber-500"}>{score}%</span>
                </div>
                <p className="text-muted-foreground mb-6">
                  {isPassing 
                    ? "You've successfully passed this module's quiz!"
                    : "You'll need to score at least 70% to pass this module. Review the material and try again."}
                </p>
                
                <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
                  <Button variant="outline" onClick={() => navigate(`/training?module=${moduleId}`)}>
                    Review Module Materials
                  </Button>
                  {!isPassing && (
                    <Button onClick={() => {
                      setQuizCompleted(false);
                      setCurrentQuestionIndex(0);
                      setAnswers({});
                      setQuizStartTime(new Date());
                      setScore(null);
                    }}>
                      Retake Quiz
                    </Button>
                  )}
                  {isPassing && (
                    <Button onClick={() => navigate("/dashboard/candidate")}>
                      Return to Dashboard
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Training Quiz</h1>
            <p className="text-muted-foreground mt-2">
              {module.title || "Training Module Quiz"}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/training")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Training
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>Time remaining: {quiz?.time_limit ? `${quiz.time_limit} min` : "Unlimited"}</span>
              </div>
            </div>
            <CardDescription>
              <div className="mt-2">
                <Progress value={progress} className="h-2" />
              </div>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {currentQuestion?.text || "Question text not available"}
              </h3>
              
              {currentQuestion?.options && (
                <RadioGroup
                  value={answers[currentQuestionIndex]?.toString()}
                  onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, parseInt(value))}
                >
                  <div className="space-y-3">
                    {Array.isArray(currentQuestion.options) && currentQuestion.options.map((option: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2 border p-3 rounded-md">
                        <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                        <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer font-normal">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-6">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <div>
              {currentQuestionIndex === questions.length - 1 ? (
                <Button 
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(answers).length < questions.length || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion}
                  disabled={!hasAnsweredCurrent}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TrainingQuiz;
