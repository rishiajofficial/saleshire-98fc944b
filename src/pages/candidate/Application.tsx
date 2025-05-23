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
import ApplicationStepAssessment from "@/components/candidate/ApplicationStepAssessment";
import { AlertCircle } from "lucide-react";
import { updateApplicationStatus } from "@/hooks/useDatabaseQuery";

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
  const [hasAppliedBefore, setHasAppliedBefore] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  useEffect(() => {
    const selectedJob = localStorage.getItem("selectedJob");
    console.log("Selected job from localStorage:", selectedJob);
    
    if (!selectedJob) {
      console.log("No job selected, redirecting to job openings");
      navigate("/job-openings");
      return;
    }

    try {
      const jobData = JSON.parse(selectedJob);
      console.log("Parsed job data:", jobData);
      setJobDetails(jobData);
    } catch (error) {
      console.log("Could not parse job data as JSON, using as job ID");
      
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
      if (!user || !jobDetails?.id) return;

      try {
        // Fetch candidate data
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
        
        // Check for existing application
        const { data: applicationData, error: applicationError } = await supabase
          .from("job_applications")
          .select("id, status")
          .eq("candidate_id", user.id)
          .eq("job_id", jobDetails.id)
          .single();
            
        if (!applicationError && applicationData) {
          setHasAppliedBefore(true);
          setApplicationId(applicationData.id);
          
          // If status is 'applied' or 'hr_review', application is complete
          if (applicationData.status === 'applied' || applicationData.status === 'hr_review') {
            setIsSubmitted(true);
          }
        } else {
          // Create a new application record with 'in_progress' status
          const { data: newApplication, error: createError } = await supabase
            .from("job_applications")
            .insert({
              candidate_id: user.id,
              job_id: jobDetails.id,
              status: 'in_progress'
            })
            .select('id')
            .single();
            
          if (createError) {
            console.error("Error creating application record:", createError);
          } else if (newApplication) {
            setApplicationId(newApplication.id);
          }
        }
      } catch (error) {
        console.error("Error in fetchApplicationData:", error);
      }
    };

    fetchApplicationData();
  }, [user, jobDetails?.id]);

  const handleNext = async () => {
    // Update application status to reflect current step
    if (applicationId) {
      await supabase
        .from("job_applications")
        .update({
          status: `in_progress_step_${currentStep + 1}`
        })
        .eq("id", applicationId);
    }
    
    setCurrentStep((step) => Math.min(step + 1, steps.length));
  };
  
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

    if (isSubmitted) {
      toast({
        title: "Already Submitted",
        description: "Your application has already been submitted.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, fetch the latest candidate data including the uploaded files
      const { data: candidateData, error: fetchError } = await supabase
        .from("candidates")
        .select("resume, about_me_video, sales_pitch_video")
        .eq("id", user.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Update the candidate status with the job name
      const jobTitle = jobDetails?.title || "Unknown Position";
      const newStatus = `Applied to job: ${jobTitle}`;
      
      await updateApplicationStatus(user.id, {
        status: newStatus,
        job_title: jobTitle
      });
      
      if (applicationId) {
        // Update existing application record
        const { error: updateError } = await supabase
          .from("job_applications")
          .update({
            status: 'hr_review'
          })
          .eq("id", applicationId);
          
        if (updateError) throw updateError;
      } else if (jobDetails?.id) {
        // Create new application record if somehow we don't have one
        const { error: applicationError } = await supabase
          .from("job_applications")
          .insert({
            candidate_id: user.id,
            job_id: jobDetails.id,
            status: 'hr_review'
          });
          
        if (applicationError) throw applicationError;
      }

      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully and is now under HR review.",
      });

      setIsSubmitted(true);
      navigate("/dashboard/candidate");
      
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
    ["profile_created", "application_in_progress", "applied"].includes(candidateStatus.toLowerCase());

  const showApplicationSubmittedAlert = isSubmitted || 
    (candidateStatus && ["hr_review", "hr_approved", "training", "manager_interview", "paid_project"].includes(candidateStatus.toLowerCase()));

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

        {hasAppliedBefore && isSubmitted && (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Already Applied</AlertTitle>
            <AlertDescription>
              You have already applied for this position. You can view your application status in your dashboard.
            </AlertDescription>
            <div className="mt-2">
              <Button size="sm" onClick={() => navigate("/dashboard/candidate")}>
                View Application Status
              </Button>
            </div>
          </Alert>
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

        {!isSubmitted && (
          <>
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
          </>
        )}

        {isSubmitted ? (
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
