
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  Clock,
  FileText,
  PlayCircle,
  BookOpen,
  Briefcase,
  CalendarPlus,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

const CandidateDashboard = () => {
  const [candidateData, setCandidateData] = useState({
    name: "Jane Smith",
    email: "candidate@example.com",
    currentStep: 2,
    stepStatus: {
      application: "completed",
      training: "in_progress",
      salesTask: "pending",
      interview: "pending",
    },
    trainingProgress: 60,
    upcomingDeadline: "2023-10-15",
    notifications: [
      {
        id: 1,
        message: "Your application has been reviewed and approved",
        date: "2 days ago",
        read: true,
      },
      {
        id: 2,
        message: "New training module available: Product Knowledge",
        date: "1 day ago",
        read: false,
      },
      {
        id: 3,
        message: "Quiz reminder: Complete Sales Techniques quiz by Friday",
        date: "5 hours ago",
        read: false,
      },
    ],
  });

  // Load user from local storage if available
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Update name and email if available
        setCandidateData(prev => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          currentStep: user.currentStep || prev.currentStep,
        }));
      } catch (e) {
        console.error("Error parsing user data from localStorage", e);
      }
    }
  }, []);

  const trainingModules = [
    {
      id: 1,
      title: "Product Knowledge",
      description: "Learn about our security products, features, and target customers",
      progress: 100,
      status: "completed",
      quizScore: "85%",
      path: "/training?module=product"
    },
    {
      id: 2,
      title: "Sales Techniques",
      description: "Master effective pitching, objection handling, and closing techniques",
      progress: 70,
      status: "in_progress",
      quizScore: null,
      path: "/training?module=sales"
    },
    {
      id: 3,
      title: "Retailer Relationships",
      description: "Strategies for building and maintaining relationships with retailers",
      progress: 0,
      status: "locked",
      quizScore: null,
      path: "/training"
    },
  ];

  const getStepNumber = (step: string) => {
    switch (step) {
      case "application":
        return 1;
      case "training":
        return 2;
      case "salesTask":
        return 3;
      case "interview":
        return 4;
      default:
        return 0;
    }
  };

  const getStepStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="mr-1 h-3 w-3" /> In Progress
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const getModuleStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Check className="mr-1 h-3 w-3" /> Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="mr-1 h-3 w-3" /> In Progress
          </Badge>
        );
      case "locked":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Locked
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidate Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {candidateData.name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Content - 8 columns */}
          <div className="md:col-span-8 space-y-6">
            {/* Hiring Journey Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Your Hiring Journey</CardTitle>
                <CardDescription>
                  Track your progress through the hiring process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-full absolute top-4">
                      <div className="h-1 bg-secondary w-full"></div>
                    </div>
                    {["application", "training", "salesTask", "interview"].map(
                      (step, index) => (
                        <div
                          key={index}
                          className="relative flex flex-col items-center text-center z-10"
                          style={{ width: "25%" }}
                        >
                          <div
                            className={`flex items-center justify-center h-8 w-8 rounded-full text-sm ${
                              getStepNumber(step) < candidateData.currentStep
                                ? "bg-green-500 text-white"
                                : getStepNumber(step) === candidateData.currentStep
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {getStepNumber(step) < candidateData.currentStep ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              getStepNumber(step)
                            )}
                          </div>
                          <div className="mt-2 max-w-[120px]">
                            <p className="text-sm font-medium mb-1">
                              {step === "application"
                                ? "Application"
                                : step === "training"
                                ? "Training"
                                : step === "salesTask"
                                ? "Sales Task"
                                : "Interview"}
                            </p>
                            <div className="text-xs">
                              {getStepStatusBadge(candidateData.stepStatus[step as keyof typeof candidateData.stepStatus])}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium mb-2">Current Step: Training & Quizzes</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete all training modules and pass the corresponding quizzes to move to the next step.
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Overall Training Progress</span>
                        <span className="text-sm font-medium">{candidateData.trainingProgress}%</span>
                      </div>
                      <Progress value={candidateData.trainingProgress} className="h-2" />
                    </div>
                    <Button size="sm" asChild>
                      <Link to="/training">
                        Continue Training <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Modules */}
            <Card>
              <CardHeader>
                <CardTitle>Training Modules</CardTitle>
                <CardDescription>
                  Complete all modules and quizzes to progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trainingModules.map((module) => (
                    <div key={module.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-lg">{module.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {module.description}
                          </p>
                        </div>
                        <div>{getModuleStatusBadge(module.status)}</div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-medium">{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          {module.quizScore && (
                            <div className="flex items-center text-sm text-green-600">
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Quiz Score: {module.quizScore}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          {module.status !== "locked" && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9"
                                asChild
                              >
                                <Link to={module.path}>
                                  <PlayCircle className="mr-1 h-4 w-4" />
                                  {module.status === "completed" ? "Review" : "Continue"}
                                </Link>
                              </Button>
                              {module.status === "in_progress" && (
                                <Button 
                                  size="sm" 
                                  className="h-9"
                                  asChild
                                >
                                  <Link to={`/training/quiz/${module.id === 1 ? 'product' : module.id === 2 ? 'sales' : 'retailer'}`}>
                                    <FileText className="mr-1 h-4 w-4" />
                                    Take Quiz
                                  </Link>
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 4 columns */}
          <div className="md:col-span-4 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <Clock className="mr-1 h-3 w-3" /> In Training Phase
                  </Badge>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <CalendarPlus className="text-muted-foreground mr-2 h-5 w-5" />
                  <span className="text-muted-foreground mr-1">Deadline:</span>
                  <span className="font-medium">Oct 15, 2023</span>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidateData.notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        !notification.read ? "bg-secondary/50 border-primary/10" : ""
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {notification.date}
                        </span>
                        {!notification.read && (
                          <Badge className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  View All Notifications
                </Button>
              </CardFooter>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/application">
                    <FileText className="mr-2 h-4 w-4" />
                    View Application
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/training">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Training Center
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Sales Task (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CandidateDashboard;
