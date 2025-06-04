
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/auth';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Video, CheckCircle, AlertCircle } from "lucide-react";

interface ApplicationStepUploadSalesVideoProps {
  onNext: () => void;
  onBack: () => void;
  applicationData: any;
  setApplicationData: (data: any) => void;
}

const ApplicationStepUploadSalesVideo = ({ 
  onNext, 
  onBack, 
  applicationData, 
  setApplicationData 
}: ApplicationStepUploadSalesVideoProps) => {
  const { user } = useAuth();
  const videoUpload = useSupabaseStorage('candidate-videos');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchExistingVideo = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from("candidates")
          .select("sales_pitch_video")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        
        if (data?.sales_pitch_video) {
          setApplicationData(prev => ({ ...prev, salesPitchVideo: data.sales_pitch_video }));
        }
      } catch (error) {
        console.error("Error fetching existing video:", error);
      }
    };
    
    fetchExistingVideo();
  }, [user?.id, setApplicationData]);

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.includes('video')) {
      toast.error('Please upload a video file');
      return;
    }

    try {
      setUploading(true);
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
      setUploading(false);
    }
  };

  const canProceed = applicationData.salesPitchVideo;

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Video className="h-5 w-5" />
            Sales Pitch Video
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Demonstrate your sales skills with a 2-3 minute pitch video
          </p>
        </CardHeader>
        <CardContent>
          {applicationData.salesPitchVideo ? (
            <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Sales pitch video uploaded successfully!</p>
                <p className="text-sm text-green-700">You can submit your application or upload a new video.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Sales Pitch Guidelines:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Keep it between 2-3 minutes</li>
                  <li>• Choose a product or service you're passionate about</li>
                  <li>• Structure: Problem → Solution → Benefits → Call to Action</li>
                  <li>• Be confident and persuasive</li>
                  <li>• Show your natural sales ability</li>
                </ul>
              </div>
              
              <Label htmlFor="sales-video" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {uploading ? 'Uploading...' : 'Upload your sales pitch video'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported formats: MP4, MOV, AVI (Max 50MB)
                  </p>
                </div>
              </Label>
              <Input
                id="sales-video"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
          )}
          
          {applicationData.salesPitchVideo && (
            <div className="mt-4">
              <Label htmlFor="video-replace" className="cursor-pointer">
                <Button variant="outline" size="sm" disabled={uploading}>
                  Replace Video
                </Button>
              </Label>
              <Input
                id="video-replace"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
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
            <p className="font-medium text-amber-800">Sales Pitch Video Required</p>
            <p className="text-sm text-amber-700 mt-1">
              Please upload your sales pitch video to complete your application.
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
          {uploading ? "Uploading..." : "Complete Application"}
        </Button>
      </div>
    </div>
  );
};

export default ApplicationStepUploadSalesVideo;
