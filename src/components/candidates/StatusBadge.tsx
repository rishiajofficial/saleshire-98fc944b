
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  // Check if the status includes "Applied to job:" pattern
  if (status?.toLowerCase().includes('applied to job:')) {
    return (
      <Badge className="bg-blue-100 text-blue-800 whitespace-normal">
        {status}
      </Badge>
    );
  }
  
  // Handle standard statuses
  switch (status?.toLowerCase()) {
    case "profile_created":
      return (
        <Badge className="bg-gray-100 text-gray-800">
          <User className="mr-1 h-3 w-3" /> Profile Created
        </Badge>
      );
    case "applied":
    case "application_in_progress":
      return (
        <Badge className="bg-blue-100 text-blue-800">
          Application in Progress (Step 1)
        </Badge>
      );
    case "hr_review":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="mr-1 h-3 w-3" /> HR Review (Step 2)
        </Badge>
      );
    case "hr_approved":
    case "training":
      return (
        <Badge className="bg-purple-100 text-purple-800">
          Training Phase (Step 3)
        </Badge>
      );
    case "manager_interview":
      return (
        <Badge className="bg-green-100 text-green-800">
          Manager Interview (Step 4)
        </Badge>
      );
    case "paid_project":
    case "sales_task":
      return (
        <Badge className="bg-orange-100 text-orange-800">
          Paid Project (Step 5)
        </Badge>
      );
    case "hired":
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" /> Hired (Step 6)
        </Badge>
      );
    case "rejected":
    case "archived":
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="mr-1 h-3 w-3" /> {status === "archived" ? "Archived" : "Rejected"} (Step 7)
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
