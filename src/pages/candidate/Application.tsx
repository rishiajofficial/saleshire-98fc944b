import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Loader2, Upload, FileText, Video } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  resume: z.string().min(1, "Resume is required"),
  aboutMeVideo: z.string().min(1, "About me video is required"),
  salesPitchVideo: z.string().min(1, "Sales pitch video is required"),
});

const steps = [
  { id: 1, label: "Profile Info" },
  { id: 2, label: "Uploads" },
  { id: 3, label: "Assessment" },
];

const Application = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [candidateStatus, setCandidateStatus] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState({
    resume: null,
    aboutMeVideo: null,
    salesPitchVideo: null,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [jobDetails, setJobDetails] = useState<{ id: string, title: string } | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resume: "",
      aboutMeVideo: "",
      salesPitchVideo: "",
    },
  });

  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAboutVideo, setUploadingAboutVideo] = useState(false);
  const [uploadingSalesVideo, setUploadingSalesVideo] = useState(false);

  const uploadFileAndGetUrl = async (file: File, path: string): Promise<string | null> => {
    try {
      const { error: uploadError } = await supabase.storage
        .from('candidateartifacts')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      const { data } = supabase.storage
        .from('candidateartifacts')
        .getPublicUrl(path);

      if (!data?.publicUrl) {
        throw new Error("Could not get public URL after upload.");
      }

      return data.publicUrl;

    } catch (error) {
      console.error("Error during file upload process:", error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "An unknown error occurred during upload.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
      return;
    }
    const file = e.target.files[0];
    const fileExtension = file.name.split('.').pop();
    const filePath = `${user.id}/resume.${fileExtension}`;
    console.log('[handleResumeUpload] Calculated file path:', filePath);
    
    setUploadingResume(true);
    const publicUrl = await uploadFileAndGetUrl(file, filePath);
    setUploadingResume(false);

    if (publicUrl) {
      form.setValue("resume", publicUrl);
      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully.",
      });
    } else {
      e.target.value = "";
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "aboutMe" | "salesPitch") => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
      return;
    }
    const file = e.target.files[0];
    const fileExtension = file.name.split('.').pop();
    const fieldName = type === "aboutMe" ? "aboutMeVideo" : "salesPitchVideo";
    const filePath = `${user.id}/${fieldName}.${fileExtension}`;
    console.log(`[handleVideoUpload - ${type}] Calculated file path:`, filePath);
    const setUploading = type === "aboutMe" ? setUploadingAboutVideo : setUploadingSalesVideo;

    setUploading(true);
    const publicUrl = await uploadFileAndGetUrl(file, filePath);
    setUploading(false);

    if (publicUrl) {
      form.setValue(fieldName, publicUrl);
      toast({
        title: "Video uploaded",
        description: `Your ${type === "aboutMe" ? "about me" : "sales pitch"} video has been uploaded successfully.`,
      });
    } else {
      e.target.value = "";
    }
  };

  useEffect(() => {
    const selectedJob = localStorage.getItem("selectedJob");
    if (!selectedJob) {
      navigate("/job-openings");
      return;
    }

    const mockJobs = [
      { id: "job-a", title: "Sales Executive" },
      { id: "job-b", title: "Business Development Associate" },
      { id: "job-c", title: "Field Sales Representative" },
    ];

    const found = mockJobs.find(j => j.id === selectedJob);
    if (found) setJobDetails(found);
  }, [navigate]);

  useEffect(() => {
    console.log("[Application.tsx] Running useEffect to fetch application data...");
    const fetchApplicationData = async () => {
      if (!user) {
        console.log("[Application.tsx] useEffect - No user, returning.");
        return;
      }
      console.log("[Application.tsx] useEffect - User found, fetching data for:", user.id);

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

          form.setValue("resume", data.resume || "");
          form.setValue("aboutMeVideo", data.about_me_video || "");
          form.setValue("salesPitchVideo", data.sales_pitch_video || "");

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
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit an application.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("candidates")
        .update({
          resume: values.resume,
          about_me_video: values.aboutMeVideo,
          sales_pitch_video: values.salesPitchVideo,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully.",
      });

      setIsSubmitted(true);
      navigate("/dashboard/candidate");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveExternalUrl = (type: "resume" | "aboutMeVideo" | "salesPitchVideo", url: string) => {
    form.setValue(type, url);
    toast({
      title: "URL saved",
      description: `Your ${type === "resume" ? "resume" : type === "aboutMeVideo" ? "about me video" : "sales pitch video"} URL has been saved.`,
    });
  };

  const showApplicationRequiredAlert = 
    candidateStatus && 
    ["applied", "screening"].includes(candidateStatus.toLowerCase());

  const showApplicationSubmittedAlert = isSubmitted;

  const handleNext = () => setCurrentStep((step) => Math.min(step + 1, steps.length));
  const handleBack = () => setCurrentStep((step) => Math.max(step - 1, 1));

  useEffect(() => {
    if(isSubmitted) {
      localStorage.removeItem("selectedJob");
    }
  }, [isSubmitted]);

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
          <div className="mb-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Profile Information</h2>
              <ul className="grid gap-2 text-base">
                <li><b>Name:</b> {user?.user_metadata?.name || "-"}</li>
                <li><b>Email:</b> {user?.email}</li>
                <li><b>Phone:</b> {user?.user_metadata?.phone || "-"}</li>
                <li><b>Location:</b> {user?.user_metadata?.location || "-"}</li>
                <li><b>Region:</b> {user?.user_metadata?.region || "-"}</li>
              </ul>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => setCurrentStep(3))} className="space-y-8">
              <div className="grid gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2" />
                      Resume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="resumeUpload">Upload your Resume</Label>
                      <div className="text-xs text-gray-600 mb-2">
                        Please upload your latest resume in PDF or DOCX format.
                      </div>
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="resumeUpload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PDF, DOCX (MAX. 5MB)</p>
                          </div>
                          <input
                            id="resumeUpload"
                            type="file"
                            className="hidden"
                            onChange={handleResumeUpload}
                            disabled={isSubmitted}
                          />
                        </label>
                      </div>
                      <FormMessage />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Video className="mr-2" />
                      About Me Video
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="aboutMeUpload">Upload About Me Video</Label>
                      <div className="text-xs text-gray-600 mb-2">
                        Briefly introduce yourself and your interests in this short (~1 minute) video.
                      </div>
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="aboutMeUpload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">MP4, MOV, WEBM (MAX. 100MB)</p>
                          </div>
                          <input
                            id="aboutMeUpload"
                            type="file"
                            className="hidden"
                            onChange={(e) => handleVideoUpload(e, "aboutMe")}
                            disabled={isSubmitted}
                          />
                        </label>
                      </div>
                      <FormMessage />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Video className="mr-2" />
                      Sales Pitch Video
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="salesPitchUpload">Upload Sales Pitch Video</Label>
                      <div className="text-xs text-gray-600 mb-2">
                        Record a short sales pitch (up to 2 minutes) demonstrating your selling skills, confidence and personality.
                      </div>
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="salesPitchUpload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">MP4, MOV, WEBM (MAX. 100MB)</p>
                          </div>
                          <input
                            id="salesPitchUpload"
                            type="file"
                            className="hidden"
                            onChange={(e) => handleVideoUpload(e, "salesPitch")}
                            disabled={isSubmitted}
                          />
                        </label>
                      </div>
                      <FormMessage />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between mt-4">
                <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                <Button type="submit">Next</Button>
              </div>
            </form>
          </Form>
        )}

        {currentStep === 3 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Assessment</h2>
            <div className="bg-gray-100 rounded p-4 mb-2">
              <div className="text-gray-700">
                This is where the assessment for <strong>{jobDetails?.title}</strong> would appear.
                <br />
                (Assessment integration will be handled as per backend mapping.)
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <Button onClick={handleBack} variant="outline">Back</Button>
              <Button onClick={() => setIsSubmitted(true)} disabled={isLoading}>
                {isLoading ? "Submitting..." : "Finish Application"}
              </Button>
            </div>
          </div>
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
