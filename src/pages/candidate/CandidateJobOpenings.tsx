
import React, { useState } from "react";
import { AlertCircle, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useJobOpenings } from "@/hooks/useJobOpenings";
import { JobCard } from "@/components/jobs/JobCard";
import CandidateNavbar from "@/components/layout/CandidateNavbar";

const CandidateJobOpenings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    jobs,
    isLoading,
    userApplications,
    jobToDelete,
    isDeleting,
    setJobToDelete,
    handleApply,
    handleDeleteApplication
  } = useJobOpenings();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CandidateNavbar />
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading job openings...</div>
          </div>
        </div>
      </div>
    );
  }

  const filteredJobs = jobs?.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateNavbar />
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Job Openings</h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Find your next opportunity and apply to positions that match your skills.
          </p>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {searchTerm 
                ? "No jobs found matching your search criteria." 
                : "No job openings available at the moment. Please check back later."
              }
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                applicationStatus={userApplications[job.id]}
                onApply={handleApply}
                onWithdraw={setJobToDelete}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
        <AlertDialogContent className="mx-4 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw your application? This action cannot be undone and will remove all your progress including training and assessment data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApplication}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {isDeleting ? "Withdrawing..." : "Withdraw Application"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CandidateJobOpenings;
