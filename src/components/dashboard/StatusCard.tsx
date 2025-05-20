
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface StatusCardProps {
  currentStep: number;
  candidateStatus?: string | null;
}

export const StatusCard = ({ currentStep, candidateStatus }: StatusCardProps) => {
  const getStatusBadge = () => {
    let statusText = "Unknown";
    let statusIcon = <Clock className="mr-1 h-3 w-3" />;
    let badgeClass = "bg-gray-100 text-gray-800";

    if (candidateStatus === 'hired') {
      statusText = "Hired";
      statusIcon = <CheckCircle2 className="mr-1 h-3 w-3" />;
      badgeClass = "bg-green-100 text-green-800";
    } else if (candidateStatus === 'rejected' || candidateStatus === 'archived') {
      statusText = candidateStatus === 'archived' ? "Archived" : "Not Selected";
      statusIcon = <XCircle className="mr-1 h-3 w-3" />;
      badgeClass = "bg-red-100 text-red-800";
    } else {
      switch (currentStep) {
        case 1: statusText = "Application in Progress"; badgeClass = "bg-blue-100 text-blue-800"; break;
        case 2: statusText = "HR Review Phase"; badgeClass = "bg-yellow-100 text-yellow-800"; break;
        case 3: statusText = "Training Phase"; badgeClass = "bg-purple-100 text-purple-800"; break;
        case 4: statusText = "Manager Interview Phase"; badgeClass = "bg-green-100 text-green-800"; break;
        case 5: statusText = "Paid Project Phase"; badgeClass = "bg-orange-100 text-orange-800"; break;
        default: statusText = "Applied"; badgeClass = "bg-gray-100 text-gray-800";
      }
    }

    return (
      <Badge className={`${badgeClass} hover:${badgeClass}`}> 
        {statusIcon} {statusText}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Application Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          {getStatusBadge()}
        </div>
      </CardContent>
    </Card>
  );
};
