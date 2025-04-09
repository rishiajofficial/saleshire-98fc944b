
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  AlertCircle,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import TrainingModuleList from "@/components/dashboard/TrainingModuleList";

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  
  // Fetch candidate data
  const { data: candidateData, isLoading } = useQuery({
    queryKey: ['candidate-dashboard-data', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("No user found");
      
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
  
  // Fetch notifications - this would be from a real notifications table in a complete app
  const { data: notifications = [] } = useQuery({
    queryKey: ['candidate-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      if (!candidateData) return [];
      
      // Generate notifications based on candidate status
      const notifs = [];
      
      // Check if application is complete
      const applicationSubmitted = 
        candidateData.resume !== null && 
        candidateData.about_me_video !== null && 
        candidateData.sales_pitch_video !== null;
        
      if (!applicationSubmitted) {
        notifs.push({
          id: 1,
          message: "Complete your application to begin the hiring process",
          date: "Just now",
          read: false,
        });
      } else if (candidateData.current_step === 1) {
        notifs.push({
          id: 1,
          message: "Your application has been submitted and is being reviewed",
          date: "Just now",
          read: false,
        });
      } else if (candidateData.current_step === 2) {
        notifs.push({
          id: 1,
          message: "Your application has been reviewed and approved",
          date: "2 days ago",
          read: true,
        });
        notifs.push({
          id: 2,
          message: "HR interview scheduled for next week",
          date: "1 day ago",
          read: false,
        });
      } else if (candidateData.current_step === 3) {
        notifs.push({
          id: 1,
          message: "You've been approved for training",
          date: "3 days ago",
          read: true,
        });
        notifs.push({
          id: 2,
          message: "New training module available: Product Knowledge",
          date: "2 days ago",
          read: false,
        });
        notifs.push({
          id: 3,
          message: "Quiz reminder: Complete Sales Techniques quiz by Friday",
          date: "5 hours ago",
          read: false,
        });
      } else if (candidateData.current_step === 4) {
        notifs.push({
          id: 1,
          message: "Congratulations! You've completed all training modules",
          date: "3 days ago",
          read: true,
        });
        notifs.push({
          id: 2,
          message: "Manager interview scheduled",
          date: "2 days ago",
          read: false,
        });
      } else if (candidateData.current_step === 5) {
        notifs.push({
          id: 1,
          message: "Manager interview completed successfully!",
          date: "5 days ago",
          read: true,
        });
        notifs.push({
          id: 2,
          message: "Sales task assigned: Visit 3 shops this week",
          date: "1 day ago",
          read: false,
        });
      }
      
      return notifs;
    },
    enabled: !!user && !!candidateData
  });

  useEffect(() => {
    if (candidateData?.current_step === 1 && 
        !(candidateData.resume && candidateData.about_me_video && candidateData.sales_pitch_video)) {
      setTimeout(() => {
        toast.info(
          "Please complete your application to begin the hiring process",
          {
            action: {
              label: "Complete Now",
              onClick: () => navigate("/application"),
            },
            duration: 8000,
          }
        );
      }, 1000);
    }
  }, [candidateData, navigate]);

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

  const getCurrentStepName = () => {
    if (!candidateData) return "Application";
    
    switch (candidateData.current_step) {
      case 1: return "Application and Assessment";
      case 2: return "HR Review and Interview";
      case 3: return "Training";
      case 4: return "Manager Interview";
      case 5: return "Paid Project/Sales Task";
      default: return "Application";
    }
  };

  const getCurrentStepDescription = () => {
    if (!candidateData) return "Complete your application to begin the hiring process.";
    
    switch (candidateData.current_step) {
      case 1: return "Complete your application and assessments to demonstrate your skills.";
      case 2: return "Your application is being reviewed by HR. Prepare for an HR interview.";
      case 3: return "Complete all training modules and pass the corresponding quizzes to move to the next step.";
      case 4: return "Prepare for your upcoming interview with a regional manager.";
      case 5: return "Complete your assigned sales tasks to demonstrate your skills in a real-world scenario.";
      default: return "Complete your application to begin the hiring process.";
    }
  };

  const getStatusBadge = () => {
    if (!candidateData) return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        <Clock className="mr-1 h-3 w-3" /> Application Phase
      </Badge>
    );
    
    switch (candidateData.current_step) {
      case 1: return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Clock className="mr-1 h-3 w-3" /> Application Phase
        </Badge>
      );
      case 2: return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Clock className="mr-1 h-3 w-3" /> HR Review Phase
        </Badge>
      );
      case 3: return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Clock className="mr-1 h-3 w-3" /> Training Phase
        </Badge>
      );
      case 4: return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Clock className="mr-1 h-3 w-3" /> Manager Interview Phase
        </Badge>
      );
      case 5: return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Clock className="mr-1 h-3 w-3" /> Sales Task Phase
        </Badge>
      );
      default: return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Clock className="mr-1 h-3 w-3" /> Application Phase
        </Badge>
      );
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  // Check if application is complete
  const applicationSubmitted = candidateData && 
    candidateData.resume !== null && 
    candidateData.about_me_video !== null && 
    candidateData.sales_pitch_video !== null;

  // Calculate step statuses
  const stepStatus = candidateData ? {
    application: applicationSubmitted ? "completed" : "pending",
    hrReview: candidateData.current_step >= 2 ? (candidateData.current_step > 2 ? "completed" : "in_progress") : "pending",
    training: candidateData.current_step >= 3 ? (candidateData.current_step > 3 ? "completed" : "in_progress") : "pending",
    managerInterview: candidateData.current_step >= 4 ? (candidateData.current_step > 4 ? "completed" : "in_progress") : "pending",
    salesTask: candidateData.current_step >= 5 ? (candidateData.current_step > 5 ? "completed" : "in_progress") : "pending",
  } : {
    application: "pending",
    hrReview: "pending",
    training: "pending",
    managerInterview: "pending",
    salesTask: "pending",
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidate Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {profile?.name || "Candidate"}
          </p>
        </div>

        {!applicationSubmitted && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="text-amber-500 h-5 w-5 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Application Required</h3>
              <p className="text-sm text-amber-700 mt-1">
                You need to complete your application before proceeding with the hiring process.
              </p>
              <Button 
                size="sm" 
                className="mt-3 bg-amber-600 hover:bg-amber-700"
                asChild
              >
                <Link to="/application">
                  Complete Application Now
                </Link>
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-6">
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
                    {["application", "hrReview", "training", "managerInterview", "salesTask"].map(
                      (step, index) => (
                        <div
                          key={index}
                          className="relative flex flex-col items-center text-center z-10"
                          style={{ width: "20%" }}
                        >
                          <div
                            className={`flex items-center justify-center h-8 w-8 rounded-full text-sm ${
                              stepStatus[step as keyof typeof stepStatus] === "completed"
                                ? "bg-green-500 text-white"
                                : candidateData && index + 1 === candidateData.current_step
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {stepStatus[step as keyof typeof stepStatus] === "completed" ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="mt-2 max-w-[120px]">
                            <p className="text-xs font-medium mb-1">
                              {step === "application"
                                ? "Application"
                                : step === "hrReview"
                                ? "HR Review"
                                : step === "training"
                                ? "Training"
                                : step === "managerInterview"
                                ? "Manager Interview"
                                : "Sales Task"}
                            </p>
                            <div className="text-xs">
                              {getStepStatusBadge(stepStatus[step as keyof typeof stepStatus])}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium mb-2">Current Step: {getCurrentStepName()}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {getCurrentStepDescription()}
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm font-medium">
                          {applicationSubmitted 
                            ? Math.min((candidateData?.current_step || 1) * 20, 100)
                            : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={applicationSubmitted ? Math.min((candidateData?.current_step || 1) * 20, 100) : 0} 
                        className="h-2" 
                      />
                    </div>
                    
                    {!applicationSubmitted ? (
                      <Button size="sm" asChild>
                        <Link to="/application">
                          Complete Application <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : candidateData?.current_step === 3 ? (
                      <Button size="sm" asChild>
                        <Link to="/training">
                          Continue Training <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Replace this with the new TrainingModuleList component */}
            <TrainingModuleList currentStep={candidateData?.current_step || 1} />
          </div>

          <div className="md:col-span-4 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {applicationSubmitted ? (
                    getStatusBadge()
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      <Clock className="mr-1 h-3 w-3" /> Application Pending
                    </Badge>
                  )}
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <CalendarPlus className="text-muted-foreground mr-2 h-5 w-5" />
                  <span className="text-muted-foreground mr-1">Deadline:</span>
                  <span className="font-medium">Oct 15, 2023</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map((notification: any) => (
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
                    ))
                  ) : (
                    <div className="p-3 text-center text-muted-foreground">
                      No notifications
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  View All Notifications
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  asChild
                >
                  <Link to="/application">
                    <FileText className="mr-2 h-4 w-4" />
                    {applicationSubmitted ? "View Application" : "Complete Application"}
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  disabled={!applicationSubmitted}
                  asChild={!!applicationSubmitted}
                >
                  {applicationSubmitted ? (
                    <Link to="/training">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Training Center
                    </Link>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Training Center (Complete Application First)
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  disabled={candidateData?.current_step < 3}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  {candidateData?.current_step >= 3 ? "Sales Task" : "Sales Task (Coming Soon)"}
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
