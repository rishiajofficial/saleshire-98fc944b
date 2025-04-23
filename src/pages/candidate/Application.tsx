
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import ApplicationStepProfile from "@/components/candidate/ApplicationStepProfile";
import ApplicationStepUploads from "@/components/candidate/ApplicationStepUploads";
import ApplicationStepAssessment from "@/components/candidate/ApplicationStepAssessment";

const steps = [
  { id: 1, label: "Profile Info" },
  { id: 2, label: "Uploads" },
  { id: 3, label: "Assessment" },
];

const Application = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [candidateStatus, setCandidateStatus] = useState<string | null>(null);
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

  useEffect(() => {
    // Check if the user has already selected a job; if not, redirect to job openings
    const selectedJob = localStorage.getItem("selectedJob");
    console.log("Selected job from localStorage:", selectedJob);
    
    if (!selectedJob) {
      console.log("No job selected, redirecting to job openings");
      navigate("/job-openings");
      return;
    }

    // Try to parse the selected job data
    try {
      // First attempt to parse as JSON
      const jobData = JSON.parse(selectedJob);
      console.log("Parsed job data:", jobData);
      setJobDetails(jobData);
    } catch (error) {
      // If parsing fails, try to use it as a simple job ID
      console.log("Could not parse job data as JSON, using as job ID");
      
      // For backwards compatibility, check if it's one of the mock jobs
      const mockJobs = [
        { id: "job-a", title: "Sales Executive" },
        { id: "job-b", title: "Business Development Associate" },
        { id: "job-c", title: "Field Sales Representative" },
      ];

      const found = mockJobs.find(j => j.id === selectedJob);
      if (found) {
        console.log("Found mock job:", found);
        setJobDetails(found);
      } else {
        // If it's not a mock job, fetch the real job details from Supabase
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
    }
  }, [navigate]);

  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("candidates")
          .select("resume, about_me_video, sales_pitch_video, status")
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

          setCandidateStatus(data.status);

          if (data.resume && data.about_me_video && data.sales_pitch_video) {
            setIsSubmitted(true);
          }
        }
      } catch (error) {
        console.error("Error in fetchApplicationData:", error);
      }
    };

    fetchApplicationData();
  }, [user]);

  const handleNext = () => setCurrentStep((step) => Math.min(step + 1, steps.length));
  const handleBack = () => setCurrentStep((step) => Math.max(step - 1, 1));
  
  const handleComplete = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit an application.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("candidates")
        .update({
          resume: applicationData.resume,
          about_me_video: applicationData.aboutMeVideo,
          sales_pitch_video: applicationData.salesPitchVideo,
          status: 'applied'
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully.",
      });

      setIsSubmitted(true);
      navigate("/dashboard/candidate");
      
      // Clean up the job selection from localStorage
      localStorage.removeItem("selectedJob");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  const showApplicationRequiredAlert = 
    candidateStatus && 
    ["applied", "screening"].includes(candidateStatus.toLowerCase());

  const showApplicationSubmittedAlert = isSubmitted;

  return (
    <MainLayout>
      <div className="container mx-auto py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">My Application</h1>
        
        {jobDetails && (
          <div className="bg-blue-50 px-4 py-2 rounded mb-8">
            <div className="font-semibold">
              Job Applied:&nbsp; <span className="text-blue-800">{jobDetails.title}</span>
            </div>
            <div className="text-xs text-gray-600">Application Steps: Profile &rarr; Uploads &rarr; Assessment</div>
          </div>
        )}

        <div className="flex gap-4 mb-8">
          {steps.map(s => (
            <div key={s.id} className={`flex-1 flex flex-col items-center`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center mb-1
                ${currentStep === s.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}
              `}>{s.id}</div>
              <span className={`text-xs ${currentStep === s.id ? 'font-bold text-blue-700' : 'text-gray-500'}`}>{s.label}</span>
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <ApplicationStepProfile 
            onNext={handleNext}
            profileData={profileData}
            setProfileData={setProfileData}
          />
        )}

        {currentStep === 2 && (
          <ApplicationStepUploads 
            onNext={handleNext}
            onBack={handleBack}
            applicationData={applicationData}
            setApplicationData={setApplicationData}
          />
        )}

        {currentStep === 3 && jobDetails && (
          <ApplicationStepAssessment
            onBack={handleBack}
            onComplete={handleComplete}
            jobId={jobDetails.id}
          />
        )}

        {showApplicationSubmittedAlert ? (
          <Alert className="mb-8">
            <AlertTitle>Application Submitted</AlertTitle>
            <AlertDescription>
              Your application has been submitted and is being reviewed.
              You'll be notified when there's an update on your application status.
            </AlertDescription>
          </Alert>
        ) : showApplicationRequiredAlert ? (
          <Alert className="mb-8" variant="destructive">
            <AlertTitle>Application Required</AlertTitle>
            <AlertDescription>
              Please complete your application to begin the hiring process.
              All fields are required.
            </AlertDescription>
          </Alert>
        ) : null}
      </div>
    </MainLayout>
  );
};

export default Application;
