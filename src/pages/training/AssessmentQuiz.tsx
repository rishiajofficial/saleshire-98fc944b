
import React, { useState, useEffect, useRef } from "react";
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
import { AlertCircle, CheckCircle, RefreshCw, ArrowLeft, Clock } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const SECONDS_PER_QUESTION = 30;

// Define a type for our assessment questions
interface AssessmentQuestion {
  id: number;
  text: string;
  options: string[];
  correctOption: string;
  section: string;
}

const AssessmentQuiz = () => {
  const navigate = useNavigate();
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answerTimings, setAnswerTimings] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(SECONDS_PER_QUESTION);
  const [activeSection, setActiveSection] = useState("resilience");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<AssessmentQuestion[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to get all assessment questions
  const getAllAssessmentQuestions = (): AssessmentQuestion[] => {
    return [
      // Resilience Section (Handling Rejection & Setbacks)
      {
        id: 1,
        text: "A shopkeeper refuses your product. What do you do next?",
        options: [
          "Politely thank them and move to the next shop",
          "Insist that they listen to your full pitch",
          "Argue and try to convince them",
          "Leave and never visit again"
        ],
        correctOption: "A",
        section: "resilience"
      },
      {
        id: 2,
        text: "You face 10 rejections in a row. How do you stay motivated?",
        options: [
          "Take a break and re-strategize",
          "Quit the job because it's not working",
          "Keep visiting more shops and refine the pitch",
          "Blame the product and complain to the manager"
        ],
        correctOption: "C",
        section: "resilience"
      },
      {
        id: 3,
        text: "A customer rudely dismisses your pitch. How do you respond?",
        options: [
          "Stay polite and move on to the next shop",
          "Argue and try to change their mind",
          "Leave negative feedback about the shop",
          "Insist they listen to you"
        ],
        correctOption: "A",
        section: "resilience"
      },
      {
        id: 4,
        text: "How do you recover from a failed sales attempt?",
        options: [
          "Analyze what went wrong and improve",
          "Feel bad and avoid similar shops",
          "Blame the customer for not understanding",
          "Stop making efforts"
        ],
        correctOption: "A",
        section: "resilience"
      },
      {
        id: 5,
        text: "What do you do if your sales numbers are lower than expected?",
        options: [
          "Look for new strategies and improve pitching skills",
          "Make excuses and blame market conditions",
          "Request an easier sales region",
          "Stop putting in extra effort"
        ],
        correctOption: "A",
        section: "resilience"
      },
      // Self-Motivation Section (Drive & Initiative)
      {
        id: 6,
        text: "What is your biggest motivation in sales?",
        options: [
          "Earning good commissions",
          "Meeting new people and learning",
          "Completing daily tasks with minimum effort",
          "Avoiding pressure from the manager"
        ],
        correctOption: "B",
        section: "motivation"
      },
      {
        id: 7,
        text: "How do you plan your daily visits to maximize efficiency?",
        options: [
          "Follow a planned route and optimize time",
          "Visit randomly without planning",
          "Only visit shops that seem easy to convince",
          "Skip visiting and only report progress"
        ],
        correctOption: "A",
        section: "motivation"
      },
      {
        id: 8,
        text: "What would you do if your sales region has very few customers?",
        options: [
          "Expand the search and explore nearby areas",
          "Give up and request a different region",
          "Wait for customers to contact you",
          "Complain that it's too difficult"
        ],
        correctOption: "A",
        section: "motivation"
      },
      {
        id: 9,
        text: "You have no direct supervision. How do you ensure productivity?",
        options: [
          "Follow personal goals and work with discipline",
          "Work only when someone is monitoring",
          "Take it easy and relax",
          "Delay tasks until asked by the manager"
        ],
        correctOption: "A",
        section: "motivation"
      },
      {
        id: 10,
        text: "How do you handle situations where you don't feel motivated?",
        options: [
          "Push yourself and remember long-term benefits",
          "Skip work and wait for motivation to return",
          "Complain about the job and think of quitting",
          "Do minimal work to avoid getting noticed"
        ],
        correctOption: "A",
        section: "motivation"
      },
      // Adaptability Section (Adjusting to Situations & Learning from Mistakes)
      {
        id: 11,
        text: "If your current sales pitch isn't working, what do you do?",
        options: [
          "Modify it based on feedback",
          "Keep using the same approach",
          "Blame the product and stop trying",
          "Avoid difficult customers"
        ],
        correctOption: "A",
        section: "adaptability"
      },
      {
        id: 12,
        text: "A shopkeeper has different needs than expected. How do you adjust?",
        options: [
          "Ask about their requirements and modify your pitch",
          "Insist on your original pitch",
          "Ignore their needs and talk about all features",
          "Give up on the sale"
        ],
        correctOption: "A",
        section: "adaptability"
      },
      {
        id: 13,
        text: "You forgot a key product detail while pitching. What's your next step?",
        options: [
          "Admit it and provide correct info later",
          "Guess the answer and pretend you know",
          "End the conversation quickly",
          "Get defensive and change the topic"
        ],
        correctOption: "A",
        section: "adaptability"
      },
      {
        id: 14,
        text: "You are sent to a new territory with no prior experience. How do you prepare?",
        options: [
          "Research the market and understand the local needs",
          "Expect the same results as in other areas",
          "Wait for someone to guide you",
          "Assume it will be easy and take it casually"
        ],
        correctOption: "A",
        section: "adaptability"
      },
      {
        id: 15,
        text: "How do you learn from unsuccessful sales attempts?",
        options: [
          "Analyze the mistake and improve",
          "Ignore and move to the next attempt",
          "Blame the customers for not understanding",
          "Assume that the product is the problem"
        ],
        correctOption: "A",
        section: "adaptability"
      },
      // Persuasion & Communication Skills
      {
        id: 16,
        text: "How do you start a conversation with a new shopkeeper?",
        options: [
          "Introduce yourself and ask about their needs",
          "Immediately start listing product features",
          "Assume they already know about your product",
          "Wait for them to ask you first"
        ],
        correctOption: "A",
        section: "persuasion"
      },
      {
        id: 17,
        text: "A shopkeeper is hesitant but interested. What's your next step?",
        options: [
          "Address their concerns and give more details",
          "Walk away assuming they won't buy",
          "Pressure them into making a decision",
          "Avoid them and find another shop"
        ],
        correctOption: "A",
        section: "persuasion"
      },
      {
        id: 18,
        text: "How do you explain product benefits without overwhelming the customer?",
        options: [
          "Highlight only the most relevant features",
          "List every single feature in detail",
          "Talk about the price first",
          "Keep the explanation vague"
        ],
        correctOption: "A",
        section: "persuasion"
      },
      {
        id: 19,
        text: "A customer is skeptical about product quality. How do you reassure them?",
        options: [
          "Show testimonials and quality certifications",
          "Tell them to trust you without proof",
          "Ignore their doubts and move on",
          "Argue that they are wrong"
        ],
        correctOption: "A",
        section: "persuasion"
      },
      {
        id: 20,
        text: "What's the best way to close a sale effectively?",
        options: [
          "Summarize benefits and ask for a decision",
          "Keep talking without letting them decide",
          "Wait for them to decide later",
          "Avoid asking for a decision directly"
        ],
        correctOption: "A",
        section: "persuasion"
      },
      // Relationship-Building Skills
      {
        id: 21,
        text: "How do you follow up after making a sale?",
        options: [
          "Call or visit for feedback and future needs",
          "Forget about them and move to new customers",
          "Wait for them to contact you",
          "Assume they will reorder without follow-up"
        ],
        correctOption: "A",
        section: "relationship"
      },
      {
        id: 22,
        text: "How do you turn a one-time buyer into a loyal customer?",
        options: [
          "Build rapport and provide value over time",
          "Offer discounts every time",
          "Hope they remember your product",
          "Ignore them after the sale"
        ],
        correctOption: "A",
        section: "relationship"
      },
      {
        id: 23,
        text: "How do you handle a long-term customer who suddenly stops ordering?",
        options: [
          "Reach out and understand their concerns",
          "Assume they don't need the product anymore",
          "Blame them for stopping orders",
          "Avoid contacting them"
        ],
        correctOption: "A",
        section: "relationship"
      }
    ];
  };

  // Function to get section name
  const getSectionName = (section: string): string => {
    switch (section) {
      case "resilience":
        return "Resilience (Handling Rejection & Setbacks)";
      case "motivation":
        return "Self-Motivation (Drive & Initiative)";
      case "adaptability":
        return "Adaptability (Adjusting to Situations)";
      case "persuasion":
        return "Persuasion & Communication Skills";
      case "relationship":
        return "Relationship-Building Skills";
      default:
        return "Assessment";
    }
  };

  // Function to shuffle questions
  const shuffleQuestions = (questionsArray: AssessmentQuestion[]): AssessmentQuestion[] => {
    // Create a copy to prevent modifying the original array
    const shuffled = [...questionsArray];
    
    // Group questions by section
    const sectionGroups: Record<string, AssessmentQuestion[]> = {};
    shuffled.forEach(question => {
      if (!sectionGroups[question.section]) {
        sectionGroups[question.section] = [];
      }
      sectionGroups[question.section].push(question);
    });
    
    // Shuffle questions within each section
    Object.keys(sectionGroups).forEach(section => {
      sectionGroups[section] = sectionGroups[section].sort(() => Math.random() - 0.5);
    });
    
    // Combine all questions back maintaining section order
    const result: AssessmentQuestion[] = [];
    ["resilience", "motivation", "adaptability", "persuasion", "relationship"].forEach(section => {
      if (sectionGroups[section]) {
        result.push(...sectionGroups[section]);
      }
    });
    
    return result;
  };

  // Initialize questions
  useEffect(() => {
    const allQuestions = getAllAssessmentQuestions();
    setOriginalQuestions(allQuestions);
    
    // Shuffle and set questions
    const shuffledQuestions = shuffleQuestions(allQuestions);
    setQuestions(shuffledQuestions);
    
    // Set active section based on first question
    if (shuffledQuestions.length > 0) {
      setActiveSection(shuffledQuestions[0].section);
    }
    
    // Initialize timer
    startTimer();
    
    // Before unloading, warn user if assessment is not completed
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!quizCompleted) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to leave? Your progress will be lost.";
        return e.returnValue;
      }
    };
    
    // Block multiple tabs/windows
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !quizCompleted) {
        toast.error("Warning: Leaving this page may invalidate your assessment");
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Disable copy & paste
    const disableCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Copy and paste are disabled during the assessment");
    };
    
    document.addEventListener('copy', disableCopyPaste);
    document.addEventListener('paste', disableCopyPaste);
    document.addEventListener('cut', disableCopyPaste);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', disableCopyPaste);
      document.removeEventListener('paste', disableCopyPaste);
      document.removeEventListener('cut', disableCopyPaste);
    };
  }, [quizCompleted]);

  // Update active section when question changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setActiveSection(questions[currentQuestionIndex].section);
    }
  }, [currentQuestionIndex, questions]);

  // Start timer for current question
  const startTimer = () => {
    setTimeRemaining(SECONDS_PER_QUESTION);
    setStartTime(Date.now());
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - auto-submit current answer
          handleAutoSubmit();
          return SECONDS_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle auto-submission when time runs out
  const handleAutoSubmit = () => {
    // Record that time ran out for this question (if no answer selected)
    if (!answers[currentQuestionIndex]) {
      const timeSpent = SECONDS_PER_QUESTION;
      setAnswerTimings({
        ...answerTimings,
        [currentQuestionIndex]: timeSpent
      });
      
      toast.warning("Time's up! Moving to next question");
    }
    
    // Move to next question or finish quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      startTimer();
    } else {
      handleFinalSubmit();
    }
  };

  // Handle answer selection
  const handleAnswerChange = (value: string) => {
    // Record the answer
    setAnswers({
      ...answers,
      [currentQuestionIndex]: value
    });
    
    // Record the time taken to answer
    const timeSpent = SECONDS_PER_QUESTION - timeRemaining;
    setAnswerTimings({
      ...answerTimings,
      [currentQuestionIndex]: timeSpent
    });
    
    // Auto-advance to next question
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        startTimer();
      }, 300); // Small delay to show selection before moving on
    } else {
      handleFinalSubmit();
    }
  };

  // Handle final submission
  const handleFinalSubmit = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsSubmitting(true);
    
    // Calculate score (in real app, would send data to server)
    let correctAnswers = 0;
    const totalAnswered = Object.keys(answers).length;
    
    questions.forEach((question, index) => {
      const answerIndex = "ABCD".indexOf(question.correctOption);
      if (answers[index] === question.options[answerIndex]) {
        correctAnswers++;
      }
    });
    
    const percentageScore = Math.round((correctAnswers / questions.length) * 100);
    
    // Calculate avg response time
    const totalTime = Object.values(answerTimings).reduce((sum, time) => sum + time, 0);
    const avgResponseTime = Math.round(totalTime / totalAnswered);
    
    // In a real app, we would send the detailed results to the server:
    const assessmentResults = {
      answers,
      timings: answerTimings,
      score: percentageScore,
      avgResponseTime,
      totalTime,
      completedQuestions: totalAnswered,
      completedAt: new Date()
    };
    
    console.log("Assessment results:", assessmentResults);
    
    // Simulate API call with slight delay
    setTimeout(() => {
      setIsSubmitting(false);
      setQuizCompleted(true);
      setScore(percentageScore);
      
      if (percentageScore >= 70) {
        toast.success("Assessment completed successfully!");
      } else {
        toast.info("Assessment completed. Your results are available.");
      }
    }, 1500);
  };

  // Current question from the shuffled questions array
  const currentQuestion = questions[currentQuestionIndex];

  // Get tab counts for each section
  const getSectionCounts = () => {
    const counts: Record<string, number> = {};
    
    questions.forEach(q => {
      if (!counts[q.section]) counts[q.section] = 0;
      counts[q.section]++;
    });
    
    return counts;
  };
  
  const sectionCounts = getSectionCounts();

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Sales Aptitude Assessment</h1>
          <p className="text-muted-foreground mt-2">
            Each question has a {SECONDS_PER_QUESTION} second time limit. Once answered, you cannot go back.
          </p>
        </div>

        {!quizCompleted ? (
          <Card className="mb-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                  <CardDescription>
                    Section: {currentQuestion && getSectionName(currentQuestion.section)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={timeRemaining <= 10 ? "destructive" : "outline"} className="text-sm">
                    <Clock className="h-3 w-3 mr-1" /> {timeRemaining}s
                  </Badge>
                </div>
              </div>
              <Tabs value={activeSection} className="mt-4">
                <TabsList className="grid grid-cols-5">
                  <TabsTrigger value="resilience" disabled>
                    Resilience {sectionCounts.resilience && `(${sectionCounts.resilience})`}
                  </TabsTrigger>
                  <TabsTrigger value="motivation" disabled>
                    Motivation {sectionCounts.motivation && `(${sectionCounts.motivation})`}
                  </TabsTrigger>
                  <TabsTrigger value="adaptability" disabled>
                    Adaptability {sectionCounts.adaptability && `(${sectionCounts.adaptability})`}
                  </TabsTrigger>
                  <TabsTrigger value="persuasion" disabled>
                    Persuasion {sectionCounts.persuasion && `(${sectionCounts.persuasion})`}
                  </TabsTrigger>
                  <TabsTrigger value="relationship" disabled>
                    Relationship {sectionCounts.relationship && `(${sectionCounts.relationship})`}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Progress 
                value={(currentQuestionIndex + 1) / questions.length * 100} 
                className="h-2 mt-2" 
              />
            </CardHeader>
            <CardContent>
              {currentQuestion && (
                <div className="space-y-6">
                  <div className="text-lg font-medium">
                    {currentQuestion.text}
                  </div>
                  
                  <RadioGroup 
                    value={answers[currentQuestionIndex] || ""}
                    onValueChange={handleAnswerChange}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted cursor-pointer">
                        <RadioGroupItem 
                          value={option} 
                          id={`option-${index}`} 
                        />
                        <Label htmlFor={`option-${index}`} className="font-normal w-full cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <div className="text-sm text-muted-foreground">
                Choose an option to continue
              </div>
              <div className="text-sm font-medium">
                {Object.keys(answers).length} of {questions.length} answered
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Assessment Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                {score >= 70 ? (
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="h-10 w-10 text-amber-600" />
                  </div>
                )}
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">
                  Assessment Complete
                </h2>
                <p className="text-muted-foreground">
                  Your responses have been recorded
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
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center p-4 bg-muted rounded-md">
                  <div className="text-xl font-bold">
                    {Object.keys(answers).length}/{questions.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Questions Answered
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-md">
                  <div className="text-xl font-bold">
                    {Object.values(answerTimings).reduce((sum, time) => sum + time, 0)}s
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Time Taken
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="font-medium mb-2">Next Steps:</h3>
                <p className="text-muted-foreground mb-2">
                  Our team will review your assessment results and contact you soon.
                </p>
                <p className="text-muted-foreground">
                  Please continue with the other application steps in your dashboard.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/training')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Training
              </Button>
              
              <Button 
                onClick={() => navigate('/dashboard/candidate')}
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

export default AssessmentQuiz;
