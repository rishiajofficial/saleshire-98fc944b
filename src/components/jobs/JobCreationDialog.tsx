import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface JobCreationDialogProps {
  onJobCreated: (job: {
    title: string;
    description: string;
    selectedAssessment?: string;
    selectedTrainingModule?: string;
  }) => void;
  assessments: { id: string; title: string; }[];
  trainingModules: { id: string; title: string; }[];
}

const JobCreationDialog: React.FC<JobCreationDialogProps> = ({
  onJobCreated,
  assessments,
  trainingModules,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    selectedAssessment: "",
    selectedTrainingModule: "",
  });

  const handleCreateJob = () => {
    onJobCreated(newJob);
    setDialogOpen(false);
    setNewJob({
      title: "",
      description: "",
      selectedAssessment: "",
      selectedTrainingModule: "",
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Job
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new job posting.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="assessment">Required Assessment</Label>
            <Select
              value={newJob.selectedAssessment}
              onValueChange={(value) => setNewJob({ ...newJob, selectedAssessment: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an assessment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {assessments.map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id}>
                    {assessment.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="training">Required Training Module</Label>
            <Select
              value={newJob.selectedTrainingModule}
              onValueChange={(value) => setNewJob({ ...newJob, selectedTrainingModule: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a training module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {trainingModules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreateJob} className="mt-2">
            Create Job
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobCreationDialog;
