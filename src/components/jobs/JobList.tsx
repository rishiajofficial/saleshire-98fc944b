
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Job } from "@/types/job";

interface JobListProps {
  jobs: Job[];
  onJobDeleted: (jobId: string) => void;
}

const JobList: React.FC<JobListProps> = ({ jobs, onJobDeleted }) => {
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
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onJobDeleted(job.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
