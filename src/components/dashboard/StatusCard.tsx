
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileStatusBadge } from "@/components/candidate/MobileStatusBadge";

interface StatusCardProps {
  currentStep: number;
  candidateStatus?: string | null;
}

export const StatusCard = ({ currentStep, candidateStatus }: StatusCardProps) => {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Current Status</CardTitle>
      </CardHeader>
      <CardContent>
        <MobileStatusBadge 
          currentStep={currentStep} 
          candidateStatus={candidateStatus}
        />
      </CardContent>
    </Card>
  );
};
