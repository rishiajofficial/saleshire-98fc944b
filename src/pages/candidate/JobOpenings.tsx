
import React from "react";
import MainLayout from '@/components/layout/MainLayout';
import { AlertCircle } from "lucide-react";
import { useJobOpenings } from "@/hooks/useJobOpenings";
import { JobsList } from "@/components/jobs/JobsList";
import { WithdrawConfirmDialog } from "@/components/jobs/WithdrawConfirmDialog";

const JobOpenings = () => {
  const {
    jobs,
    isLoading,
    jobsError,
    userApplications,
    jobToDelete,
    isDeleting,
    setJobToDelete,
    handleApply,
    handleDeleteApplication
  } = useJobOpenings();

  if (jobsError) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12">
          <div className="text-center text-red-600 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Failed to load job openings. Please try again later.
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8">Job Openings</h2>
        
        <JobsList
          jobs={jobs || []}
          userApplications={userApplications}
          isLoading={isLoading}
          onApply={handleApply}
          onWithdraw={(jobId) => setJobToDelete(jobId)}
        />
        
        <WithdrawConfirmDialog
          isOpen={!!jobToDelete}
          isDeleting={isDeleting}
          onClose={() => setJobToDelete(null)}
          onConfirm={handleDeleteApplication}
        />
      </div>
    </MainLayout>
  );
};

export default JobOpenings;
