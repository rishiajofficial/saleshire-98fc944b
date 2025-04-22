import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Upload, Video, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';

interface ApplicationStepUploadsProps {
  onNext: () => void;
  onBack: () => void;
  applicationData: {
    resume: string | null;
    aboutMeVideo: string | null;
    salesPitchVideo: string | null;
  };
  setApplicationData: (data: any) => void;
}

const ApplicationStepUploads = ({ 
  onNext, 
  onBack, 
  applicationData, 
  setApplicationData 
}: ApplicationStepUploadsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { uploadFile: uploadResume, isUploading: uploadingResume } = useSupabaseStorage('resumes');
  const { uploadFile: uploadVideo, isUploading: uploadingVideo } = useSupabaseStorage('candidate-videos');
  
  const [uploadingAboutVideo, setUploadingAboutVideo] = useState(false);
  const [uploadingSalesVideo, setUploadingSalesVideo] = useState(false);
  
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
      return;
    }
    const file = e.target.files[0];
    const fileExtension = file.name.split('.').pop();
    const filePath = `${user.id}/resume.${fileExtension}`;
    
    const publicUrl = await uploadResume(file, filePath);
    
    if (publicUrl) {
      setApplicationData({
        ...applicationData,
        resume: publicUrl
      });
      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully.",
      });
    } else {
      e.target.value = '';
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
    const setUploading = type === "aboutMe" ? setUploadingAboutVideo : setUploadingSalesVideo;
    
    setUploading(true);
    const publicUrl = await uploadVideo(file, filePath);
    setUploading(false);
    
    if (publicUrl) {
      setApplicationData({
        ...applicationData,
        [fieldName]: publicUrl
      });
      toast({
        title: "Video uploaded",
        description: `Your ${type === "aboutMe" ? "about me" : "sales pitch"} video has been uploaded successfully.`,
      });
    } else {
      e.target.value = '';
    }
  };

  const handleRemoveFile = (type: "resume" | "aboutMeVideo" | "salesPitchVideo") => {
    setApplicationData({
      ...applicationData,
      [type]: null
    });
    
    toast({
      title: "File removed",
      description: `Your ${type === "resume" ? "resume" : type === "aboutMeVideo" ? "about me video" : "sales pitch video"} has been removed.`,
    });
  };
  
  const validateBeforeNext = () => {
    if (!applicationData.resume || !applicationData.aboutMeVideo || !applicationData.salesPitchVideo) {
      toast({
        title: "Missing files",
        description: "Please upload all required files before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    onNext();
  };

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2" />
            Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applicationData.resume ? (
            <div className="p-4 border rounded bg-muted relative">
              <div className="flex items-center">
                <FileText className="mr-2 text-blue-500" />
                <div className="flex-1 truncate">
                  <a href={applicationData.resume} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                    {applicationData.resume.split('/').pop()}
                  </a>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveFile("resume")}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
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
                    disabled={uploadingResume}
                    accept=".pdf,.docx,.doc"
                  />
                </label>
              </div>
            </div>
          )}
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
          {applicationData.aboutMeVideo ? (
            <div className="p-4 border rounded bg-muted relative">
              <div className="flex items-center">
                <Video className="mr-2 text-blue-500" />
                <div className="flex-1 truncate">
                  <a href={applicationData.aboutMeVideo} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                    {applicationData.aboutMeVideo.split('/').pop()}
                  </a>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveFile("aboutMeVideo")}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
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
                    disabled={uploadingAboutVideo}
                    accept=".mp4,.mov,.webm"
                  />
                </label>
              </div>
            </div>
          )}
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
          {applicationData.salesPitchVideo ? (
            <div className="p-4 border rounded bg-muted relative">
              <div className="flex items-center">
                <Video className="mr-2 text-blue-500" />
                <div className="flex-1 truncate">
                  <a href={applicationData.salesPitchVideo} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                    {applicationData.salesPitchVideo.split('/').pop()}
                  </a>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveFile("salesPitchVideo")}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
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
                    disabled={uploadingSalesVideo}
                    accept=".mp4,.mov,.webm"
                  />
                </label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-4">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="button" onClick={validateBeforeNext}>Next</Button>
      </div>
    </div>
  );
};

export default ApplicationStepUploads;
