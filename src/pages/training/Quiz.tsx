
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

const Quiz = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Mock quiz data based on module
  const getQuizQuestions = () => {
    switch (moduleId) {
      case "product":
        return [
          {
            id: 1,
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
            id: 2,
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
            id: 3,
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
            id: 4,
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
            id: 5,
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
            id: 1,
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
            id: 2,
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
            id: 3,
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
            id: 4,
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
            id: 5,
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
            id: 1,
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
            id: 2,
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
            id: 3,
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
            id: 4,
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
            id: 5,
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

  const questions = getQuizQuestions();
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: value
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    if (Object.keys(answers).length < questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    setIsSubmitting(true);

    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      const answerIndex = "ABCD".indexOf(question.correctAnswer);
      if (answers[index] === question.options[answerIndex]) {
        correctAnswers++;
      }
    });

    const percentageScore = Math.round((correctAnswers / questions.length) * 100);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setQuizCompleted(true);
      setScore(percentageScore);

      if (percentageScore >= 70) {
        toast.success("Congratulations! You passed the quiz.");
      } else {
        toast.error("You didn't pass the quiz. You can try again.");
      }
    }, 1500);
  };

  const getModuleTitle = () => {
    switch (moduleId) {
      case "product":
        return "Product Knowledge";
      case "sales":
        return "Sales Techniques";
      case "retailer":
        return "Retailer Relationships";
      default:
        return "Quiz";
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{getModuleTitle()} Quiz</h1>
          <p className="text-muted-foreground mt-2">
            Answer all questions to complete this module
          </p>
        </div>

        {!quizCompleted ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {Object.keys(answers).length} of {questions.length} answered
                </span>
              </div>
              <Progress 
                value={(currentQuestionIndex + 1) / questions.length * 100} 
                className="h-2 mt-2" 
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-lg font-medium">
                  {currentQuestion?.text}
                </div>
                
                <RadioGroup 
                  value={answers[currentQuestionIndex] || ""}
                  onValueChange={handleAnswerChange}
                  className="space-y-3"
                >
                  {currentQuestion?.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={option} 
                        id={`option-${index}`} 
                      />
                      <Label htmlFor={`option-${index}`} className="font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button onClick={handleNext} disabled={!answers[currentQuestionIndex]}>
                    Next Question
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length < questions.length || isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Quiz"
                    )}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Quiz Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                {score >= 70 ? (
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-10 w-10 text-red-600" />
                  </div>
                )}
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">
                  {score >= 70 ? "Congratulations!" : "Almost There!"}
                </h2>
                <p className="text-muted-foreground">
                  {score >= 70 
                    ? "You've successfully completed this module." 
                    : "You need to score at least 70% to pass this module."}
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {score}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Your Score
                </p>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="font-medium mb-2">Key Takeaways:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Review the module content again to reinforce your knowledge</li>
                  <li>Practice applying the concepts in real-world scenarios</li>
                  <li>Ask your trainer if you have any specific questions</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {score < 70 ? (
                <Button 
                  onClick={() => {
                    setQuizCompleted(false);
                    setCurrentQuestionIndex(0);
                    setAnswers({});
                  }}
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Quiz
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/training')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Training
                </Button>
              )}
              
              <Button 
                onClick={() => navigate('/dashboard/candidate')}
                variant={score >= 70 ? "default" : "outline"}
              >
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Quiz;
