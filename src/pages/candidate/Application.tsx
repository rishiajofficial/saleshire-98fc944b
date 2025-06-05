import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/auth';
import { supabase } from "@/integrations/supabase/client";
import ApplicationStepProfile from "@/components/candidate/ApplicationStepProfile";
import ApplicationStepUploadResume from "@/components/candidate/ApplicationStepUploadResume";
import ApplicationStepUploadAboutVideo from "@/components/candidate/ApplicationStepUploadAboutVideo";
import { AlertCircle, ArrowLeft, Check } from "lucide-react";
import { updateApplicationStatus } from "@/hooks/useDatabaseQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CandidateNavbar from "@/components/layout/CandidateNavbar";

const Application = () => {
  const [applicationData, setApplicationData] = useState({
    resume: null,
    aboutMeVideo: null,
  });
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [jobDetails, setJobDetails] = useState<{ id: string, title: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletedApplication, setIsCompletedApplication] = useState(false);

  const steps = [
    { 
      id: 1, 
      title: "Complete Profile", 
      description: "Tell us about yourself",
      component: "profile"
    },
    { 
      id: 2, 
      title: "Upload Resume", 
      description: "Upload your resume",
      component: "resume"
    },
    { 
      id: 3, 
      title: "Introduction Video", 
      description: "Record an introduction video",
      component: "about-video"
    }
  ];

  const totalSteps = steps.length;
  const progressPercentage = (currentStep / totalSteps) * 100;

  useEffect(() => {
    const selectedJob = localStorage.getItem("selectedJob");
    console.log("Selected job from localStorage:", selectedJob);
    
    if (!selectedJob) {
      console.log("No job selected, redirecting to job openings");
      navigate("/candidate/jobs");
      return;
    }

    try {
      const jobData = JSON.parse(selectedJob);
      console.log("Parsed job data:", jobData);
      setJobDetails(jobData);
    } catch (error) {
      console.log("Could not parse job data as JSON, using as job ID");
      
      const fetchJobDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('jobs')
            .select('id, title')
            .eq('id', selectedJob)
            .single();
            
          if (error) {
            console.error("Error fetching job details:", error);
            return;
          }
          
          if (data) {
            console.log("Fetched job details:", data);
            setJobDetails(data);
          }
        } catch (error) {
          console.error("Error fetching job:", error);
        }
      };
      
      fetchJobDetails();
    }
  }, [navigate]);

  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!user || !jobDetails?.id) return;

      try {
        // Check for existing application
        const { data: applicationData, error: applicationError } = await supabase
          .from("job_applications")
          .select("id, status")
          .eq("candidate_id", user.id)
          .eq("job_id", jobDetails.id)
          .single();

        // Fetch candidate data for pre-filling and completion check
        const { data: candidateData, error: candidateError } = await supabase
          .from("candidates")
          .select("resume, about_me_video, phone, location")
          .eq("id", user.id)
          .single();

        if (candidateError && candidateError.code !== 'PGRST116') {
          console.error("Error fetching candidate data:", candidateError);
          return;
        }

        // Check if application is complete (has all required documents)
        const isComplete = candidateData && 
          candidateData.resume && 
          candidateData.about_me_video && 
          candidateData.phone &&
          candidateData.location;

        // Only show "Already Applied" if:
        // 1. Application exists AND
        // 2. Application is complete (has all required data) AND  
        // 3. Application status indicates it's been submitted for review
        if (!applicationError && applicationData && isComplete) {
          console.log("Complete application found with status:", applicationData.status);
          setIsCompletedApplication(true);
          return;
        }

        // If we reach here, either no application exists or it's incomplete
        // Pre-fill form with existing data if available
        if (candidateData) {
          setApplicationData({
            resume: candidateData.resume,
            aboutMeVideo: candidateData.about_me_video,
          });

          const locationParts = candidateData.location?.split(', ') || ["", ""];
          setProfileData({
            name: user?.email?.split('@')[0] || "",
            email: user?.email || "",
            phone: candidateData.phone || "",
            city: locationParts[0] || "",
            state: locationParts[1] || "",
          });

          // Determine current step based on completed data
          if (!candidateData.phone || !candidateData.location) {
            setCurrentStep(1); // Need to complete profile
          } else if (!candidateData.resume) {
            setCurrentStep(2); // Need to upload resume
          } else if (!candidateData.about_me_video) {
            setCurrentStep(3); // Need intro video
          } else {
            // All data exists but no complete application - should not happen but handle gracefully
            setCurrentStep(3);
          }
        }
      } catch (error) {
        console.error("Error in fetchApplicationData:", error);
      }
    };

    fetchApplicationData();
  }, [user, jobDetails?.id]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleComplete = async () => {
    if (!user || !jobDetails?.id) {
      toast({
        title: "Error",
        description: "Missing user or job information.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Update candidate status and current step
      const jobTitle = jobDetails.title || "Unknown Position";
      await updateApplicationStatus(user.id, {
        status: 'applied',
        job_title: jobTitle,
        current_step: 2 // Move to assessment step
      });
      
      // Create or update application record with proper status
      const { error: applicationError } = await supabase
        .from("job_applications")
        .upsert({
          candidate_id: user.id,
          job_id: jobDetails.id,
          status: 'applied' // Application submitted, ready for assessment
        }, {
          onConflict: 'candidate_id,job_id'
        });
        
      if (applicationError) throw applicationError;

      toast({
        title: "Application submitted successfully!",
        description: "Your application has been completed. You can now take the assessment.",
      });

      localStorage.removeItem("selectedJob");
      
      // Redirect to dashboard with specific job selected for assessment
      navigate(`/dashboard/candidate?job=${jobDetails.id}&step=assessment`);
      
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompletedApplication) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CandidateNavbar />
        <div className="container mx-auto py-8 max-w-md px-4">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Already Applied</AlertTitle>
            <AlertDescription>
              You have already submitted a complete application for this position. You can view your application status in your dashboard.
            </AlertDescription>
            <div className="mt-3 space-y-2">
              <Button size="sm" onClick={() => navigate("/dashboard/candidate")} className="w-full">
                View Application Status
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/candidate/jobs")} className="w-full">
                View Other Jobs
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateNavbar />
      
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/candidate/jobs")}
              className="p-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Application</h1>
              {jobDetails && (
                <p className="text-sm text-gray-600 truncate">
                  {jobDetails.title}
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-4 overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center min-w-0 flex-shrink-0">
                <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium border-2 ${
                  step.id < currentStep 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : step.id === currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {step.id < currentStep ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 ${
                    step.id < currentStep ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{currentStepData?.title}</CardTitle>
            <p className="text-gray-600 text-sm">{currentStepData?.description}</p>
          </CardHeader>
          <CardContent className="pt-0">
            {currentStep === 1 && (
              <ApplicationStepProfile 
                onNext={handleNext}
                profileData={profileData}
                setProfileData={setProfileData}
              />
            )}

            {currentStep === 2 && (
              <ApplicationStepUploadResume 
                onNext={handleNext}
                onBack={handleBack}
                applicationData={applicationData}
                setApplicationData={setApplicationData}
              />
            )}

            {currentStep === 3 && (
              <ApplicationStepUploadAboutVideo 
                onNext={handleComplete}
                onBack={handleBack}
                applicationData={applicationData}
                setApplicationData={setApplicationData}
              />
            )}
          </CardContent>
        </Card>

        {/* What's Next Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>1. HR team reviews your application</p>
              <p>2. Complete assessment and training modules</p>
              <p>3. Interview with hiring manager</p>
              <p>4. Final decision and onboarding</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Application;
