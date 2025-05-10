
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import JobForm from "./JobForm";
import JobDialogTrigger from "./JobDialogTrigger";
import { useTrainingModules } from "@/hooks/useTrainingModules";
import { TrainingModuleProgress } from "@/types/training";

interface EditingJob {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  employment_type: string;
  salary_range: string;
  selectedAssessment: string;
  selectedModules: string[];
  status?: string;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

interface JobCreationDialogProps {
  onJobCreated?: (job: any) => void;
  onJobUpdated?: (job: EditingJob) => void;
  assessments: { id: string; title: string }[];
  categories?: Array<{ id: string; name: string }>;
  editingJob?: EditingJob;
  mode?: "create" | "edit" | "view";
  isOpen?: boolean;
  onClose?: () => void;
}

const JobCreationDialog: React.FC<JobCreationDialogProps> = ({
  onJobCreated,
  onJobUpdated,
  assessments,
  editingJob,
  mode = "create",
  isOpen: externalIsOpen,
  onClose
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { modules, loading, fetchTrainingModules } = useTrainingModules();

  // Fix: Only update the dialog state when externalIsOpen prop changes, not on every render
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setDialogOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  // Separate effect for fetching modules to avoid dependency issues
  useEffect(() => {
    if (dialogOpen) {
      fetchTrainingModules();
    }
  }, [dialogOpen, fetchTrainingModules]);

  const handleOpen = () => {
    setDialogOpen(true);
    fetchTrainingModules();
  };

  const handleClose = () => {
    setDialogOpen(false);
    if (onClose) onClose();
  };

  const handleSubmit = (form: any) => {
    if (mode === "edit" && onJobUpdated && editingJob) {
      const updatedJob: EditingJob = { 
        ...editingJob, 
        ...form,
        selectedAssessment: form.selectedAssessment === "none" ? null : form.selectedAssessment
      };
      onJobUpdated(updatedJob);
    } else if (onJobCreated) {
      const processedForm = {
        ...form,
        selectedAssessment: form.selectedAssessment === "none" ? null : form.selectedAssessment
      };
      onJobCreated(processedForm);
    }
    handleClose();
  };

  const getDialogTitle = () => {
    if (mode === "edit") return "Edit Job";
    if (mode === "view") return "Job Details";
    return "Create New Job";
  };

  const getDialogDescription = () => {
    if (mode === "edit") return "Update the details for this job.";
    if (mode === "view") return "Job details and requirements.";
    return "Fill in the details below to create a new job posting.";
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => {
      setDialogOpen(open);
      if (!open && onClose) onClose();
    }}>
      {!externalIsOpen && (
        <DialogTrigger asChild>
          <div>
            <JobDialogTrigger mode={mode} onClick={handleOpen} />
          </div>
        </DialogTrigger>
      )}
      <DialogContent onEscapeKeyDown={handleClose} className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <JobForm
            job={editingJob}
            onSubmit={handleSubmit}
            assessments={assessments}
            modules={modules}
            mode={mode}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobCreationDialog;
