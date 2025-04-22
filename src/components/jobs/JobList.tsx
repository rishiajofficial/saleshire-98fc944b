
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Job } from "@/types/job";
import { supabase } from "@/integrations/supabase/client";

interface JobListProps {
  jobs: Job[];
  onJobDeleted: () => void;
}

const JobList: React.FC<JobListProps> = ({ jobs, onJobDeleted }) => {
  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      onJobDeleted();
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
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
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteJob(job.id)}
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
