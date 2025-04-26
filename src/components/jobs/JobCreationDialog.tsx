import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, PencilLine, Eye, Check } from "lucide-react";
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
  categories: Array<{ id: string; name: string }>;
  mode: 'create' | 'edit' | 'view';
}

const JobForm: React.FC<JobFormProps> = ({
  job,
  onSubmit,
  assessments,
  trainingModules,
  categories,
  mode
}) => {
  const [form, setForm] = useState({
    title: job?.title || "",
    description: job?.description || "",
    department: job?.department || "",
    location: job?.location || "",
    employment_type: job?.employment_type || "",
    salary_range: job?.salary_range || "",
    selectedAssessment: job?.selectedAssessment || "none",
    selectedTrainingModule: job?.selectedTrainingModule || "none",
    categories: job?.selectedCategories || []
  });

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title || "",
        description: job.description || "",
        department: job.department || "",
        location: job.location || "",
        employment_type: job.employment_type || "",
        salary_range: job.salary_range || "",
        selectedAssessment: job.selectedAssessment || "none",
        selectedTrainingModule: job.selectedTrainingModule || "none",
        categories: job.selectedCategories || []
      });
    }
  }, [job]);

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
      <div>
        <Label htmlFor="categories">Training Categories</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              type="button"
              variant={form.categories.includes(category.id) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setForm(prev => ({
                  ...prev,
                  categories: prev.categories.includes(category.id)
                    ? prev.categories.filter(id => id !== category.id)
                    : [...prev.categories, category.id]
                }));
              }}
              disabled={isView}
            >
              {category.name}
              {form.categories.includes(category.id) && (
                <Check className="ml-2 h-4 w-4" />
              )}
            </Button>
          ))}
        </div>
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
  categories: Array<{ id: string; name: string }>;
  editingJob?: any;
  mode?: "create" | "edit" | "view";
  isOpen?: boolean;
  onClose?: () => void;
}

const JobCreationDialog: React.FC<JobCreationDialogProps> = ({
  onJobCreated,
  onJobUpdated,
  assessments,
  trainingModules,
  categories,
  editingJob,
  mode = "create",
  isOpen: externalIsOpen,
  onClose
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setDialogOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  const handleOpen = () => setDialogOpen(true);
  const handleClose = () => {
    setDialogOpen(false);
    if (onClose) onClose();
  };

  const handleSubmit = (form: any) => {
    if (mode === "edit" && onJobUpdated) {
      onJobUpdated({ ...editingJob, ...form });
    } else if (onJobCreated) {
      const processedForm = {
        ...form,
        selectedAssessment: form.selectedAssessment === "none" ? null : form.selectedAssessment,
        selectedTrainingModule: form.selectedTrainingModule === "none" ? null : form.selectedTrainingModule
      };
      onJobCreated(processedForm);
    }
    handleClose();
  };

  const triggerButton = () => {
    switch (mode) {
      case "edit":
        return (
          <Button variant="outline" size="sm" onClick={handleOpen}>
            <PencilLine className="w-4 h-4 mr-1" /> Edit
          </Button>
        );
      case "view":
        return (
          <Button variant="ghost" size="sm" onClick={handleOpen}>
            <Eye className="w-4 h-4 mr-1" /> View
          </Button>
        );
      default:
        return (
          <Button onClick={handleOpen}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Job
          </Button>
        );
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!externalIsOpen && <DialogTrigger asChild>{triggerButton()}</DialogTrigger>}
      <DialogContent onEscapeKeyDown={handleClose} onInteractOutside={handleClose}>
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
          categories={categories}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
};

export default JobCreationDialog;
