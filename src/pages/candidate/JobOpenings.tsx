
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";

const mockJobs = [
  { id: "job-a", title: "Sales Executive", description: "Drive sales and interact with clients." },
  { id: "job-b", title: "Business Development Associate", description: "Grow our business opportunities!" },
  { id: "job-c", title: "Field Sales Representative", description: "Meet clients on the field and close deals." },
];

const JobOpenings = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has already selected a job; if so, skip.
    const selectedJob = localStorage.getItem("selectedJob");
    if (selectedJob) {
      navigate("/application");
    }
  }, [navigate]);

  const handleApply = (jobId: string) => {
    localStorage.setItem("selectedJob", jobId);
    navigate("/application");
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8">Job Openings</h2>
        <div className="space-y-6">
          {mockJobs.map((job) => (
            <div key={job.id} className="border rounded-lg px-6 py-4 shadow-sm bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg">{job.title}</div>
                  <div className="text-gray-600 text-sm">{job.description}</div>
                </div>
                <Button onClick={() => handleApply(job.id)}>
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default JobOpenings;
