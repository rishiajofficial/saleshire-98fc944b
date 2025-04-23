
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, PencilLine, Eye } from "lucide-react";
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

interface JobFormProps {
  job?: any;
  onSubmit: (values: any) => void;
  assessments: { id: string; title: string }[];
  trainingModules: { id: string; title: string }[];
  mode: 'create' | 'edit' | 'view';
}

const JobForm: React.FC<JobFormProps> = ({
  job,
  onSubmit,
  assessments,
  trainingModules,
  mode
}) => {
  const [form, setForm] = useState({
    title: job?.title || "",
    description: job?.description || "",
    department: job?.department || "",
    location: job?.location || "",
    employment_type: job?.employment_type || "",
    salary_range: job?.salary_range || "",
    selectedAssessment: job?.assessment_id || "none",
    selectedTrainingModule: job?.training_module_id || "none",
  });

  const isView = mode === "view";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isView) onSubmit(form);
      }}
      className="grid gap-4 py-2"
    >
      <div>
        <Label htmlFor="title">Job Title</Label>
        <Input
          id="title"
          value={form.title}
          disabled={isView}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          disabled={isView}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          value={form.department}
          disabled={isView}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={form.location}
          disabled={isView}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="employment_type">Employment Type</Label>
        <Select
          value={form.employment_type}
          disabled={isView}
          onValueChange={(value) => setForm({ ...form, employment_type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select employment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Full-Time">Full-Time</SelectItem>
            <SelectItem value="Part-Time">Part-Time</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
            <SelectItem value="Internship">Internship</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="salary_range">Salary Range</Label>
        <Input
          id="salary_range"
          value={form.salary_range}
          disabled={isView}
          onChange={(e) => setForm({ ...form, salary_range: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="assessment">Required Assessment</Label>
        <Select
          value={form.selectedAssessment}
          disabled={isView}
          onValueChange={(value) => setForm({ ...form, selectedAssessment: value })}
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
          value={form.selectedTrainingModule}
          disabled={isView}
          onValueChange={(value) => setForm({ ...form, selectedTrainingModule: value })}
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
      {!isView && (
        <Button className="mt-2" type="submit">
          {mode === "edit" ? "Update Job" : "Create Job"}
        </Button>
      )}
    </form>
  );
};

interface JobCreationDialogProps {
  onJobCreated?: (job: any) => void;
  onJobUpdated?: (job: any) => void;
  assessments: { id: string; title: string }[];
  trainingModules: { id: string; title: string }[];
  editingJob?: any;
  mode?: "create" | "edit" | "view";
}

const JobCreationDialog: React.FC<JobCreationDialogProps> = ({
  onJobCreated,
  onJobUpdated,
  assessments,
  trainingModules,
  editingJob,
  mode = "create"
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = () => setDialogOpen(true);
  const handleClose = () => setDialogOpen(false);

  const handleSubmit = (form: any) => {
    if (mode === "edit" && onJobUpdated) {
      onJobUpdated({ ...editingJob, ...form });
    } else if (onJobCreated) {
      // Handle the case for "none" values to save as null or empty string
      const processedForm = {
        ...form,
        selectedAssessment: form.selectedAssessment === "none" ? null : form.selectedAssessment,
        selectedTrainingModule: form.selectedTrainingModule === "none" ? null : form.selectedTrainingModule
      };
      onJobCreated(processedForm);
    }
    handleClose();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {mode === "edit" ? (
          <Button variant="outline" size="sm">
            <PencilLine className="w-4 h-4 mr-1" /> Edit
          </Button>
        ) : mode === "view" ? (
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-1" /> View
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Job
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit"
              ? "Edit Job"
              : mode === "view"
              ? "Job Details"
              : "Create New Job"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the details for this job."
              : mode === "view"
              ? "Job details and requirements."
              : "Fill in the details below to create a new job posting."}
          </DialogDescription>
        </DialogHeader>
        <JobForm
          job={editingJob}
          onSubmit={handleSubmit}
          assessments={assessments}
          trainingModules={trainingModules}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
};

export default JobCreationDialog;
