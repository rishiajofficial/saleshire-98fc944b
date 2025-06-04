
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/auth';
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import ApplicationStepProfile from "@/components/candidate/ApplicationStepProfile";
import ApplicationStepUploads from "@/components/candidate/ApplicationStepUploads";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { updateApplicationStatus } from "@/hooks/useDatabaseQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Application = () => {
  const [applicationData, setApplicationData] = useState({
    resume: null,
    aboutMeVideo: null,
    salesPitchVideo: null,
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
  const [hasExistingApplication, setHasExistingApplication] = useState(false);

  const steps = [
    { id: 1, title: "Complete Profile", description: "Personal information" },
    { id: 2, title: "Upload Documents", description: "Resume and videos" }
  ];

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
            
        if (!applicationError && applicationData) {
          setHasExistingApplication(true);
          return;
        }

        // Fetch candidate data for pre-filling
        const { data, error } = await supabase
          .from("candidates")
          .select("resume, about_me_video, sales_pitch_video, phone, location")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching application data:", error);
          return;
        }

        if (data) {
          setApplicationData({
            resume: data.resume,
            aboutMeVideo: data.about_me_video,
            salesPitchVideo: data.sales_pitch_video,
          });

          const locationParts = data.location?.split(', ') || ["", ""];
          setProfileData({
            name: user?.email?.split('@')[0] || "",
            email: user?.email || "",
            phone: data.phone || "",
            city: locationParts[0] || "",
            state: locationParts[1] || "",
          });

          // Check if profile is complete
          if (data.phone && data.location) {
            setCurrentStep(2);
          }
        }
      } catch (error) {
        console.error("Error in fetchApplicationData:", error);
      }
    };

    fetchApplicationData();
  }, [user, jobDetails?.id]);

  const handleNext = () => {
    setCurrentStep((step) => Math.min(step + 1, steps.length));
  };
  
  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
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

      // Update candidate status
      const jobTitle = jobDetails.title || "Unknown Position";
      await updateApplicationStatus(user.id, {
        status: 'applied',
        job_title: jobTitle
      });
      
      // Create application record
      const { error: applicationError } = await supabase
        .from("job_applications")
        .insert({
          candidate_id: user.id,
          job_id: jobDetails.id,
          status: 'hr_review'
        });
        
      if (applicationError) throw applicationError;

      toast({
        title: "Application submitted successfully!",
        description: "Your application is now under review. You can track your progress in the dashboard.",
      });

      localStorage.removeItem("selectedJob");
      navigate("/dashboard/candidate");
      
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

  if (hasExistingApplication) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 max-w-2xl">
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Already Applied</AlertTitle>
            <AlertDescription>
              You have already applied for this position. You can view your application status in your dashboard.
            </AlertDescription>
            <div className="mt-2 space-x-2">
              <Button size="sm" onClick={() => navigate("/dashboard/candidate")}>
                View Application Status
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/candidate/jobs")}>
                View Other Jobs
              </Button>
            </div>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/candidate/jobs")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Complete Application</h1>
            {jobDetails && (
              <p className="text-gray-600 text-sm">
                for <span className="font-medium text-blue-600">{jobDetails.title}</span>
              </p>
            )}
          </div>
        </div>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Application Progress</CardTitle>
              <span className="text-sm text-gray-500">{currentStep}/{steps.length}</span>
            </div>
            <Progress value={(currentStep / steps.length) * 100} className="mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    step.id === currentStep
                      ? 'bg-blue-50 border-blue-200'
                      : step.id < currentStep
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.id === currentStep
                        ? 'bg-blue-600 text-white'
                        : step.id < currentStep
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step.id < currentStep ? '✓' : step.id}
                  </div>
                  <div>
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-gray-600">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <ApplicationStepProfile 
                onNext={handleNext}
                profileData={profileData}
                setProfileData={setProfileData}
              />
            )}

            {currentStep === 2 && (
              <div>
                <ApplicationStepUploads 
                  onNext={handleComplete}
                  onBack={handleBack}
                  applicationData={applicationData}
                  setApplicationData={setApplicationData}
                />
                
                <div className="flex justify-between mt-6 pt-4 border-t">
                  <Button onClick={handleBack} variant="outline">
                    Back
                  </Button>
                  <Button 
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="min-w-32"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps Preview */}
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
    </MainLayout>
  );
};

export default Application;
