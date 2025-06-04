
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/auth';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface ApplicationStepUploadResumeProps {
  onNext: () => void;
  onBack: () => void;
  applicationData: any;
  setApplicationData: (data: any) => void;
}

const ApplicationStepUploadResume = ({ 
  onNext, 
  onBack, 
  applicationData, 
  setApplicationData 
}: ApplicationStepUploadResumeProps) => {
  const { user } = useAuth();
  const resumeUpload = useSupabaseStorage('resumes');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchExistingResume = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from("candidates")
          .select("resume")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        
        if (data?.resume) {
          setApplicationData(prev => ({ ...prev, resume: data.resume }));
        }
      } catch (error) {
        console.error("Error fetching existing resume:", error);
      }
    };
    
    fetchExistingResume();
  }, [user?.id, setApplicationData]);

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    try {
      setUploading(true);
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
      setUploading(false);
    }
  };

  const canProceed = applicationData.resume;

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Your Resume
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Upload your most recent resume in PDF or Word format
          </p>
        </CardHeader>
        <CardContent>
          {applicationData.resume ? (
            <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Resume uploaded successfully!</p>
                <p className="text-sm text-green-700">You can continue to the next step or upload a new resume.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Label htmlFor="resume" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {uploading ? 'Uploading...' : 'Drop your resume here or click to browse'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported formats: PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              </Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
          )}
          
          {applicationData.resume && (
            <div className="mt-4">
              <Label htmlFor="resume-replace" className="cursor-pointer">
                <Button variant="outline" size="sm" disabled={uploading}>
                  Replace Resume
                </Button>
              </Label>
              <Input
                id="resume-replace"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {!canProceed && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Resume Required</p>
            <p className="text-sm text-amber-700 mt-1">
              Please upload your resume to continue with your application.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!canProceed || uploading}
        >
          {uploading ? "Uploading..." : "Next: Introduction Video"}
        </Button>
      </div>
    </div>
  );
};

export default ApplicationStepUploadResume;
