
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

interface MobileStatusBadgeProps {
  currentStep: number;
  candidateStatus?: string | null;
  compact?: boolean;
}

export const MobileStatusBadge = ({ currentStep, candidateStatus, compact = false }: MobileStatusBadgeProps) => {
  const getStatusInfo = () => {
    let statusText = "Unknown";
    let statusIcon = <Clock className="mr-1 h-3 w-3" />;
    let badgeClass = "bg-gray-100 text-gray-800";
    let description = "";

    if (candidateStatus === 'hired') {
      statusText = "Hired";
      statusIcon = <CheckCircle2 className="mr-1 h-3 w-3" />;
      badgeClass = "bg-green-100 text-green-800";
      description = "Congratulations! You've been selected.";
    } else if (candidateStatus === 'rejected' || candidateStatus === 'archived') {
      statusText = candidateStatus === 'archived' ? "Archived" : "Not Selected";
      statusIcon = <XCircle className="mr-1 h-3 w-3" />;
      badgeClass = "bg-red-100 text-red-800";
      description = "Thank you for your interest.";
    } else {
      switch (currentStep) {
        case 1: 
          statusText = "Submit Application"; 
          badgeClass = "bg-blue-100 text-blue-800"; 
          description = "Complete your application to proceed";
          statusIcon = <AlertCircle className="mr-1 h-3 w-3" />;
          break;
        case 2: 
          if (candidateStatus === 'hr_review') {
            statusText = "Under Review"; 
            badgeClass = "bg-yellow-100 text-yellow-800"; 
            description = "Application under review, assessment will be available soon";
          } else {
            statusText = "Complete Assessment"; 
            badgeClass = "bg-purple-100 text-purple-800"; 
            description = "Take your assessment test";
          }
          break;
        case 3: 
          statusText = "Training Phase"; 
          badgeClass = "bg-purple-100 text-purple-800"; 
          description = "Complete training modules";
          break;
        case 4: 
          statusText = "Interview Phase"; 
          badgeClass = "bg-green-100 text-green-800"; 
          description = "Schedule your interview";
          break;
        case 5: 
          statusText = "Final Assessment"; 
          badgeClass = "bg-orange-100 text-orange-800"; 
          description = "Complete final evaluation";
          break;
        default: 
          statusText = "Applied"; 
          badgeClass = "bg-gray-100 text-gray-800";
          description = "Application received";
      }
    }

    return { statusText, statusIcon, badgeClass, description };
  };

  const { statusText, statusIcon, badgeClass, description } = getStatusInfo();

  if (compact) {
    return (
      <Badge className={`${badgeClass} hover:${badgeClass}`}> 
        {statusIcon} {statusText}
      </Badge>
    );
  }

  return (
    <div className="text-center space-y-2">
      <Badge className={`${badgeClass} hover:${badgeClass} text-sm px-3 py-1`}> 
        {statusIcon} {statusText}
      </Badge>
      {description && (
        <p className="text-xs text-gray-600">{description}</p>
      )}
    </div>
  );
};
