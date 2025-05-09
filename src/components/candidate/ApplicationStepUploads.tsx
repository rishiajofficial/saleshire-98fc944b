import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Upload, Video, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/contexts/auth';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { supabase } from "@/integrations/supabase/client";

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
  const [uploadProgress, setUploadProgress] = useState({
    resume: 0,
    aboutMe: 0,
    salesPitch: 0
  });
  
  // Helper function to save URLs to the candidates table
  const saveToCandidateProfile = async (fieldName: string, url: string) => {
    if (!user) return false;
    
    try {
      // Build the update object dynamically
      const updateObj: {[key: string]: string} = {};
      
      // Map the field names to database column names
      const fieldNameMapping: {[key: string]: string} = {
        'resume': 'resume',
        'aboutMeVideo': 'about_me_video',
        'salesPitchVideo': 'sales_pitch_video'
      };
      
      updateObj[fieldNameMapping[fieldName]] = url;
      
      // Update the candidate record in the database
      const { error } = await supabase
        .from('candidates')
        .update(updateObj)
        .eq('id', user.id);
      
      if (error) {
        console.error('Error saving to candidate profile:', error);
        throw error;
      }
      
      return true;
    } catch (err) {
      console.error('Failed to save to candidate profile:', err);
      return false;
    }
  };
  
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
      return;
    }
    const file = e.target.files[0];
    const fileExtension = file.name.split('.').pop();
    const filePath = `${user.id}/resume.${fileExtension}`;
    
    setUploadProgress(prev => ({ ...prev, resume: 10 }));
    
    const publicUrl = await uploadResume(file, filePath);
    
    if (publicUrl) {
      // First update the local state
      setApplicationData({
        ...applicationData,
        resume: publicUrl
      });
      
      // Then save to the database
      const saved = await saveToCandidateProfile('resume', publicUrl);
      
      setUploadProgress(prev => ({ ...prev, resume: 100 }));
      
      if (saved) {
        toast({
          title: "Resume uploaded",
          description: "Your resume has been uploaded and saved successfully.",
        });
      } else {
        toast({
          title: "Partial success",
          description: "Resume uploaded but there was an issue saving to your profile. Please try again or contact support.",
          variant: "destructive"
        });
      }
    } else {
      setUploadProgress(prev => ({ ...prev, resume: 0 }));
      e.target.value = '';
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive"
      });
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
    setUploadProgress(prev => ({ ...prev, [type]: 10 }));
    
    const publicUrl = await uploadVideo(file, filePath);
    setUploading(false);
    
    if (publicUrl) {
      // First update the local state
      setApplicationData({
        ...applicationData,
        [fieldName]: publicUrl
      });
      
      // Then save to the database
      const saved = await saveToCandidateProfile(fieldName, publicUrl);
      
      setUploadProgress(prev => ({ ...prev, [type]: 100 }));
      
      if (saved) {
        toast({
          title: "Video uploaded",
          description: `Your ${type === "aboutMe" ? "about me" : "sales pitch"} video has been uploaded and saved successfully.`,
        });
      } else {
        toast({
          title: "Partial success",
          description: `Video uploaded but there was an issue saving to your profile. Please try again or contact support.`,
          variant: "destructive"
        });
      }
    } else {
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      e.target.value = '';
      toast({
        title: "Upload failed",
        description: `There was an error uploading your ${type === "aboutMe" ? "about me" : "sales pitch"} video. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleRemoveFile = async (type: "resume" | "aboutMeVideo" | "salesPitchVideo") => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage your files.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Map the field names to database column names
      const fieldNameMapping: {[key: string]: string} = {
        'resume': 'resume',
        'aboutMeVideo': 'about_me_video',
        'salesPitchVideo': 'sales_pitch_video'
      };
      
      // Update the database to remove the file reference
      const updateObj: {[key: string]: null} = {};
      updateObj[fieldNameMapping[type]] = null;
      
      const { error } = await supabase
        .from('candidates')
        .update(updateObj)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setApplicationData({
        ...applicationData,
        [type]: null
      });
      
      setUploadProgress(prev => ({ 
        ...prev, 
        [type === "resume" ? "resume" : type === "aboutMeVideo" ? "aboutMe" : "salesPitch"]: 0 
      }));
      
      toast({
        title: "File removed",
        description: `Your ${type === "resume" ? "resume" : type === "aboutMeVideo" ? "about me video" : "sales pitch video"} has been removed.`,
      });
    } catch (error: any) {
      console.error("Error removing file:", error);
      toast({
        title: "Error",
        description: `Failed to remove file: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  const validateBeforeNext = () => {
    if (!applicationData.resume && !applicationData.aboutMeVideo && !applicationData.salesPitchVideo) {
      toast({
        description: "You haven't uploaded any files. You can still proceed, but we recommend uploading at least one file to support your application.",
        duration: 5000,
      });
    }
    onNext();
  };

  const renderUploadProgress = (progress: number) => {
    if (progress === 0) return null;
    
    return (
      <div className="mt-2">
        <Progress value={progress} className="w-full" />
        <p className="text-xs text-gray-500 mt-1">
          {progress < 100 ? "Uploading..." : "Upload complete"}
        </p>
      </div>
    );
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
              <Label htmlFor="resumeUpload">Upload your Resume (Optional)</Label>
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
              {renderUploadProgress(uploadProgress.resume)}
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
              <Label htmlFor="aboutMeUpload">Upload About Me Video (Optional)</Label>
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
              {renderUploadProgress(uploadProgress.aboutMe)}
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
              <Label htmlFor="salesPitchUpload">Upload Sales Pitch Video (Optional)</Label>
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
              {renderUploadProgress(uploadProgress.salesPitch)}
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
