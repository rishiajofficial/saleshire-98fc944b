
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Candidate } from '@/types/candidate';
import { StatusBadge } from './StatusBadge';

interface StatusUpdateSectionProps {
  applicationStatus: string;
  isUpdatingStatus: boolean;
  candidateData: Candidate | null;
  onStatusChange: (value: string) => void;
  onStatusUpdate: () => void;
}

export const StatusUpdateSection = ({
  applicationStatus,
  isUpdatingStatus,
  candidateData,
  onStatusChange,
  onStatusUpdate
}: StatusUpdateSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Status</CardTitle>
        <CardDescription>
          Update the candidate's application status
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Status</Label>
            <Select 
              value={applicationStatus} 
              onValueChange={onStatusChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="application_in_progress">Application in Progress</SelectItem>
                <SelectItem value="hr_review">HR Review</SelectItem>
                <SelectItem value="hr_approved">HR Approved</SelectItem>
                <SelectItem value="training">Training Phase</SelectItem>
                <SelectItem value="manager_interview">Manager Interview</SelectItem>
                <SelectItem value="paid_project">Paid Project</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button onClick={onStatusUpdate} disabled={isUpdatingStatus} className="mt-6">
              {isUpdatingStatus ? "Updating..." : "Update Status"}
            </Button>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Current Status:</div>
            {candidateData && <StatusBadge status={candidateData.status || ''} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

