
import React from 'react';
import { FileText, Video } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { VideoDisplay } from './VideoDisplay';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Candidate } from '@/types/candidate';

interface CandidateInfoProps {
  candidate: Candidate;
  phone: string;
  location: string;
  region: string;
  isUpdating: boolean;
  isLoading: boolean;
  onPhoneChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onUpdateInfo: () => void;
}

export const CandidateInfo = ({
  candidate,
  phone,
  location,
  region,
  isUpdating,
  isLoading,
  onPhoneChange,
  onLocationChange,
  onRegionChange,
  onUpdateInfo,
}: CandidateInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {candidate.profile?.name || "Candidate Details"}
        </CardTitle>
        <CardDescription>
          {candidate.profile?.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Application Files</h4>
          {candidate.resume ? (
            <a 
              href={candidate.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <FileText className="h-4 w-4" /> View Resume
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No resume submitted.</p>
          )}
          <VideoDisplay url={candidate.about_me_video} title="About Me Video" />
          <VideoDisplay url={candidate.sales_pitch_video} title="Sales Pitch Video" />
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              value={region}
              onChange={(e) => onRegionChange(e.target.value)}
            />
          </div>
          <div className="md:col-span-1 flex items-end">
            <Button
              onClick={onUpdateInfo}
              disabled={isUpdating || isLoading}
              className="w-full md:w-auto"
            >
              {isUpdating ? "Updating..." : "Update Info"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
