
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, PencilLine, Eye } from "lucide-react";
import { Job } from "@/types/job";
import JobCreationDialog from "./JobCreationDialog";

interface JobListProps {
  jobs: Job[];
  onJobDeleted: (jobId: string) => void;
  onJobUpdated: (job: any) => void;
  assessments: { id: string; title: string }[];
  trainingModules: { id: string; title: string }[];
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  onJobDeleted,
  onJobUpdated,
  assessments,
  trainingModules
}) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewMode, setViewMode] = useState<"view" | "edit" | null>(null);

  // Dummy function for onJobCreated prop
  const dummyOnJobCreated = () => {
    // This is not used but needed to satisfy the type requirements
    console.log("This function is not used for view/edit dialogs");
  };

  return (
    <div className="grid gap-6">
      {jobs.map((job) => (
        <Card key={job.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(job.created_at || '').toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">Department: {job.department || "N/A"}</p>
                <p className="text-xs text-gray-400">Location: {job.location || "N/A"}</p>
                <p className="text-xs text-gray-400">Employment Type: {job.employment_type || "N/A"}</p>
                <p className="text-xs text-gray-400">Salary: {job.salary_range || "N/A"}</p>
              </div>
              <div className="flex space-x-1">
                <JobCreationDialog
                  mode="view"
                  editingJob={job}
                  assessments={assessments}
                  trainingModules={trainingModules}
                  onJobCreated={dummyOnJobCreated}
                />
                <JobCreationDialog
                  mode="edit"
                  editingJob={job}
                  onJobUpdated={(updatedJob) => onJobUpdated(updatedJob)}
                  assessments={assessments}
                  trainingModules={trainingModules}
                  onJobCreated={dummyOnJobCreated}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onJobDeleted(job.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{job.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JobList;
