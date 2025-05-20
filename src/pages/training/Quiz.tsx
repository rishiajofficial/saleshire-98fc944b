import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/auth';  // Change this line
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";  // Add this import
import MainLayout from "@/components/layout/MainLayout";
import { QuizStart } from "@/components/quiz/QuizStart";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { QuizResults } from "@/components/quiz/QuizResults";
import { useQuiz } from "@/hooks/useQuiz";
import { toast } from "sonner";

const Quiz = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [quizAccess, setQuizAccess] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const { user } = useAuth();

  const { data: quizData, isLoading: loadingQuiz } = useQuery({
    queryKey: ['quizQuestions', moduleId],
    queryFn: () => getQuizQuestions(),
    enabled: !!moduleId && quizAccess
  });

  const {
    currentQuestionIndex,
    selectedAnswer,
    answers,
    isSubmitting,
    quizCompleted,
    score,
    timeRemaining,
    handleAnswerChange,
    handleSubmitAnswer,
    resetQuiz,
    startTimer
  } = useQuiz(quizData || [], moduleId || '');

  useEffect(() => {
    if (assessmentStarted) {
      startTimer();
    }
  }, [assessmentStarted, startTimer]);

  const getModuleTitle = () => {
    switch (moduleId) {
      case "product":
        return "Product Knowledge";
      case "sales":
        return "Sales Techniques";
      case "retailer":
        return "Retailer Relationships";
      default:
        return moduleId ? moduleId.charAt(0).toUpperCase() + moduleId.slice(1) : "Quiz";
    }
  };

  const getQuizQuestions = () => {
    switch (moduleId) {
      case "product":
        return [
          {
            id: "1",
            text: "What is the main advantage of our smart locks compared to traditional locks?",
            options: [
              "They are cheaper",
              "They offer remote access control",
              "They last longer",
              "They are harder to install"
            ],
            correctAnswer: "B"
          },
          {
            id: "2",
            text: "Which customer segment is most likely to purchase our high-end security systems?",
            options: [
              "Students",
              "Small apartment renters",
              "Commercial property owners",
              "First-time homeowners"
            ],
            correctAnswer: "C"
          },
          {
            id: "3",
            text: "What feature should you highlight for customers concerned primarily about safety?",
            options: [
              "Aesthetic design",
              "Remote monitoring capabilities",
              "Integration with smart home systems",
              "Low battery consumption"
            ],
            correctAnswer: "B"
          },
          {
            id: "4",
            text: "What is the warranty period for our premium-tier security products?",
            options: [
              "1 year",
              "2 years",
              "5 years",
              "Lifetime"
            ],
            correctAnswer: "C"
          },
          {
            id: "5",
            text: "Which of our products is most suitable for small retail shops?",
            options: [
              "HomeGuard Basic",
              "RetailSafe Pro",
              "ExecutiveLock Premium",
              "SmartHome Connect"
            ],
            correctAnswer: "B"
          }
        ];
      case "sales":
        return [
          {
            id: "1",
            text: "What is the most effective approach when a customer raises a price objection?",
            options: [
              "Immediately offer a discount",
              "Acknowledge the concern and focus on value",
              "Compare with more expensive competitors",
              "Change the subject to another product"
            ],
            correctAnswer: "B"
          },
          {
            id: "2",
            text: "What is the SPIN selling technique primarily focused on?",
            options: [
              "Situational, Problem, Implication, and Need-payoff questions",
              "Speaking, Presenting, Informing, and Negotiating",
              "Sales, Pricing, Inventory, and Networking",
              "Starting, Progressing, Intensifying, and Navigating conversations"
            ],
            correctAnswer: "A"
          },
          {
            id: "3",
            text: "Which of the following is a key element of an effective sales pitch?",
            options: [
              "Presenting all product features at once",
              "Speaking as quickly as possible",
              "Focusing on customer needs and pain points",
              "Avoiding all technical specifications"
            ],
            correctAnswer: "C"
          },
          {
            id: "4",
            text: "What closing technique involves assuming the sale has already been made?",
            options: [
              "Alternative close",
              "Assumptive close",
              "Urgency close",
              "Summary close"
            ],
            correctAnswer: "B"
          },
          {
            id: "5",
            text: "What is the best way to handle a customer who is comparing your product with a competitor's?",
            options: [
              "Criticize the competitor's product",
              "Acknowledge competitors' strengths but highlight your unique value",
              "Offer a significant discount immediately",
              "Suggest the customer should buy both products"
            ],
            correctAnswer: "B"
          }
        ];
      case "retailer":
        return [
          {
            id: "1",
            text: "What is a key element in building long-term relationships with retail partners?",
            options: [
              "Only contacting them when there's a new product",
              "Regular communication and follow-up",
              "Offering maximum discounts on all products",
              "Requiring exclusive contracts"
            ],
            correctAnswer: "B"
          },
          {
            id: "2",
            text: "How should you approach a retailer who has had a negative experience with your company in the past?",
            options: [
              "Avoid mentioning the past issues",
              "Blame the previous sales representative",
              "Acknowledge past issues and explain improvements",
              "Offer extreme discounts to compensate"
            ],
            correctAnswer: "C"
          },
          {
            id: "3",
            text: "What type of information should you provide to retailers about your products?",
            options: [
              "Only technical specifications",
              "Only pricing information",
              "Only marketing materials",
              "Comprehensive information including specs, pricing, and marketing support"
            ],
            correctAnswer: "D"
          },
          {
            id: "4",
            text: "What is a planogram in retail sales?",
            options: [
              "A type of retail contract",
              "A diagram that shows how and where products should be placed",
              "A schedule for sales visits",
              "A retail commission structure"
            ],
            correctAnswer: "B"
          },
          {
            id: "5",
            text: "How often should you ideally check in with your retail partners?",
            options: [
              "Only when there are new products",
              "Once a year during contract renewal",
              "Regularly based on their sales volume and preferences",
              "Only when there are issues to resolve"
            ],
            correctAnswer: "C"
          }
        ];
      default:
        return [];
    }
  };

  if (loadingQuiz) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!quizAccess) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
            <p className="mb-4">You need to watch all videos in this module before taking the quiz.</p>
            <Button onClick={() => navigate(`/training/module/${moduleId}`)}>
              Return to Module
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{getModuleTitle()} Quiz</h1>
          <p className="text-muted-foreground mt-2">
            Answer all questions to complete this module
          </p>
        </div>

        {!assessmentStarted ? (
          <QuizStart
            title={getModuleTitle()}
            description="Test your knowledge of this module"
            onStart={() => setAssessmentStarted(true)}
          />
        ) : quizCompleted ? (
          <QuizResults 
            score={score} 
            onRetry={resetQuiz} 
          />
        ) : (
          quizData && quizData[currentQuestionIndex] && (
            <QuizQuestion
              currentQuestion={quizData[currentQuestionIndex]}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={quizData.length}
              timeRemaining={timeRemaining}
              selectedAnswer={selectedAnswer}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleSubmitAnswer}
              isSubmitting={isSubmitting}
              answeredCount={Object.keys(answers).length}
            />
          )
        )}
      </div>
    </MainLayout>
  );
};

export default Quiz;
