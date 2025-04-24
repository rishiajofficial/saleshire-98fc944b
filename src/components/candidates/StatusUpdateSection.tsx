
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StatusUpdateSectionProps {
  applicationStatus: string;
  isUpdatingStatus: boolean;
  candidateData: Candidate | null;
  onStatusChange: (value: string) => void;
  onStatusUpdate: () => void;
  errorMessage?: string;
}

export const StatusUpdateSection = ({
  applicationStatus,
  isUpdatingStatus,
  candidateData,
  onStatusChange,
  onStatusUpdate,
  errorMessage
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
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
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
                <SelectItem value="application_in_progress">Application in Progress (Step 1)</SelectItem>
                <SelectItem value="hr_review">HR Review (Step 2)</SelectItem>
                <SelectItem value="hr_approved">HR Approved (Step 3)</SelectItem>
                <SelectItem value="training">Training Phase (Step 3)</SelectItem>
                <SelectItem value="manager_interview">Manager Interview (Step 4)</SelectItem>
                <SelectItem value="paid_project">Paid Project (Step 5)</SelectItem>
                <SelectItem value="sales_task">Sales Task (Step 5)</SelectItem>
                <SelectItem value="hired">Hired (Step 6)</SelectItem>
                <SelectItem value="rejected">Rejected (Step 7)</SelectItem>
                <SelectItem value="archived">Archived (Step 7)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button 
              onClick={onStatusUpdate} 
              disabled={isUpdatingStatus || (candidateData?.status === applicationStatus)} 
              className="mt-6"
            >
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
