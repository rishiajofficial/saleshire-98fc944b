
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status?.toLowerCase()) {
    case "applied":
    case "application_in_progress":
      return (
        <Badge className="bg-blue-100 text-blue-800">
          Application in Progress
        </Badge>
      );
    case "hr_review":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="mr-1 h-3 w-3" /> HR Review
        </Badge>
      );
    case "hr_approved":
    case "training":
      return (
        <Badge className="bg-purple-100 text-purple-800">
          Training Phase
        </Badge>
      );
    case "manager_interview":
      return (
        <Badge className="bg-green-100 text-green-800">
          Manager Interview
        </Badge>
      );
    case "paid_project":
      return (
        <Badge className="bg-orange-100 text-orange-800">
          Paid Project
        </Badge>
      );
    case "hired":
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" /> Hired
        </Badge>
      );
    case "rejected":
    case "archived":
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="mr-1 h-3 w-3" /> {status === "archived" ? "Archived" : "Rejected"}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status || "Unknown"}
        </Badge>
      );
  }
};

