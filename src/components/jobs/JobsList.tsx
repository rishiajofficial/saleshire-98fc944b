
import React from "react";
import { JobCard } from "./JobCard";
import Loading from "@/components/ui/loading";

interface JobsListProps {
  jobs: any[];
  userApplications: Record<string, { applied: boolean; completed: boolean }>;
  isLoading: boolean;
  onApply: (jobId: string) => void;
  onWithdraw: (jobId: string) => void;
}

export const JobsList: React.FC<JobsListProps> = ({ 
  jobs,
  userApplications,
  isLoading,
  onApply,
  onWithdraw
}) => {
  if (isLoading) {
    return <Loading message="Loading job openings..." />;
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No job openings available at the moment.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          applicationStatus={userApplications[job.id]}
          onApply={onApply}
          onWithdraw={onWithdraw}
        />
      ))}
    </div>
  );
};
