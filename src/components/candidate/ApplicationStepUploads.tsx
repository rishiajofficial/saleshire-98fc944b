
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/auth';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, FileText, Video, CheckCircle } from "lucide-react";

interface ApplicationStepUploadsProps {
  onNext: () => void;
  onBack: () => void;
  applicationData: any;
  setApplicationData: (data: any) => void;
}

const ApplicationStepUploads = ({ 
  onNext, 
  onBack, 
  applicationData, 
  setApplicationData 
}: ApplicationStepUploadsProps) => {
  const { user } = useAuth();
  const resumeUpload = useSupabaseStorage('resumes');
  const videoUpload = useSupabaseStorage('candidate-videos');
  
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAboutVideo, setUploadingAboutVideo] = useState(false);
  const [uploadingSalesVideo, setUploadingSalesVideo] = useState(false);

  useEffect(() => {
    const fetchExistingFiles = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from("candidates")
          .select("resume, about_me_video, sales_pitch_video")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setApplicationData({
            resume: data.resume,
            aboutMeVideo: data.about_me_video,
            salesPitchVideo: data.sales_pitch_video,
          });
        }
      } catch (error) {
        console.error("Error fetching existing files:", error);
      }
    };
    
    fetchExistingFiles();
  }, [user?.id, setApplicationData]);

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    try {
      setUploadingResume(true);
      const filePath = `resume-${Date.now()}.${file.name.split('.').pop()}`;
      const publicUrl = await resumeUpload.uploadFile(file, filePath);
      
      if (publicUrl) {
        await supabase
          .from("candidates")
          .update({ resume: publicUrl })
          .eq("id", user.id);
          
        setApplicationData(prev => ({ ...prev, resume: publicUrl }));
        toast.success('Resume uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAboutVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.includes('video')) {
      toast.error('Please upload a video file');
      return;
    }

    try {
      setUploadingAboutVideo(true);
      const filePath = `about-me-${Date.now()}.${file.name.split('.').pop()}`;
      const publicUrl = await videoUpload.uploadFile(file, filePath);
      
      if (publicUrl) {
        await supabase
          .from("candidates")
          .update({ about_me_video: publicUrl })
          .eq("id", user.id);
          
        setApplicationData(prev => ({ ...prev, aboutMeVideo: publicUrl }));
        toast.success('About me video uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload video');
    } finally {
      setUploadingAboutVideo(false);
    }
  };

  const handleSalesVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.includes('video')) {
      toast.error('Please upload a video file');
      return;
    }

    try {
      setUploadingSalesVideo(true);
      const filePath = `sales-pitch-${Date.now()}.${file.name.split('.').pop()}`;
      const publicUrl = await videoUpload.uploadFile(file, filePath);
      
      if (publicUrl) {
        await supabase
          .from("candidates")
          .update({ sales_pitch_video: publicUrl })
          .eq("id", user.id);
          
        setApplicationData(prev => ({ ...prev, salesPitchVideo: publicUrl }));
        toast.success('Sales pitch video uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload video');
    } finally {
      setUploadingSalesVideo(false);
    }
  };

  const canProceed = applicationData.resume && applicationData.aboutMeVideo && applicationData.salesPitchVideo;

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Upload Required Documents</h3>
        <p className="text-gray-600 text-sm">Please upload your resume and introduction videos.</p>
      </div>

      <div className="space-y-6">
        {/* Resume Upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resume (Required)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applicationData.resume ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Resume uploaded successfully</span>
              </div>
            ) : (
              <div>
                <Label htmlFor="resume" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {uploadingResume ? 'Uploading...' : 'Click to upload your resume'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF or Word document</p>
                  </div>
                </Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                  className="hidden"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* About Me Video */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="h-4 w-4" />
              About Me Video (Required)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applicationData.aboutMeVideo ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">About me video uploaded successfully</span>
              </div>
            ) : (
              <div>
                <Label htmlFor="about-video" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {uploadingAboutVideo ? 'Uploading...' : 'Upload your introduction video'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Tell us about yourself (2-3 minutes)</p>
                  </div>
                </Label>
                <Input
                  id="about-video"
                  type="file"
                  accept="video/*"
                  onChange={handleAboutVideoUpload}
                  disabled={uploadingAboutVideo}
                  className="hidden"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales Pitch Video */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="h-4 w-4" />
              Sales Pitch Video (Required)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applicationData.salesPitchVideo ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Sales pitch video uploaded successfully</span>
              </div>
            ) : (
              <div>
                <Label htmlFor="sales-video" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {uploadingSalesVideo ? 'Uploading...' : 'Upload your sales pitch video'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Demonstrate your sales skills (2-3 minutes)</p>
                  </div>
                </Label>
                <Input
                  id="sales-video"
                  type="file"
                  accept="video/*"
                  onChange={handleSalesVideoUpload}
                  disabled={uploadingSalesVideo}
                  className="hidden"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!canProceed && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Please upload all required documents to proceed with your application.
          </p>
        </div>
      )}
    </div>
  );
};

export default ApplicationStepUploads;
