
import React from "react";
import { Button } from "@/components/ui/button";

interface CandidateStatusFilterProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

export const CandidateStatusFilter: React.FC<CandidateStatusFilterProps> = ({
  currentStatus,
  onStatusChange,
}) => {
  const statuses = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "hired", label: "Hired" },
    { value: "rejected", label: "Rejected" },
    { value: "archived", label: "Archived" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {statuses.map((status) => (
        <Button
          key={status.value}
          variant={currentStatus === status.value ? "default" : "outline"}
          size="sm"
          onClick={() => onStatusChange(status.value)}
        >
          {status.label}
        </Button>
      ))}
    </div>
  );
};
