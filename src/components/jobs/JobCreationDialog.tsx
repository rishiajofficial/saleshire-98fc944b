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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface JobFormValues {
  title: string;
  description: string;
  department: string;
  location: string;
  employment_type: string;
  salary_range: string;
  selectedAssessment: string;
  selectedModules: string[];
}

interface JobFormProps {
  job?: any;
  onSubmit: (values: JobFormValues) => void;
  assessments: { id: string; title: string }[];
  modules: Array<{ id: string; name: string }>;
  mode: 'create' | 'edit' | 'view';
}

const JobForm: React.FC<JobFormProps> = ({
  job,
  onSubmit,
  assessments,
  modules,
  mode
}) => {
  const [form, setForm] = useState<JobFormValues>({
    title: job?.title || "",
    description: job?.description || "",
    department: job?.department || "",
    location: job?.location || "",
    employment_type: job?.employment_type || "",
    salary_range: job?.salary_range || "",
    selectedAssessment: job?.selectedAssessment || "none",
    selectedModules: job?.selectedModules || []
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
        selectedModules: job.selectedModules || []
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
        <Label htmlFor="assessment">Required Initial Assessment</Label>
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
        <Label htmlFor="modules">Training Modules</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {modules.map((module) => (
            <Button
              key={module.id}
              type="button"
              variant={form.selectedModules.includes(module.id) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setForm(prev => ({
                  ...prev,
                  selectedModules: prev.selectedModules.includes(module.id)
                    ? prev.selectedModules.filter(id => id !== module.id)
                    : [...prev.selectedModules, module.id]
                }));
              }}
              disabled={isView}
            >
              {module.name}
              {form.selectedModules.includes(module.id) && (
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
  onJobCreated?: (job: JobFormValues) => void;
  onJobUpdated?: (job: JobFormValues & { id?: string }) => void;
  assessments: { id: string; title: string }[];
  categories?: Array<{ id: string; name: string }>;
  editingJob?: any;
  mode?: "create" | "edit" | "view";
  isOpen?: boolean;
  onClose?: () => void;
}

const JobCreationDialog: React.FC<JobCreationDialogProps> = ({
  onJobCreated,
  onJobUpdated,
  assessments,
  categories, // Deprecated, keeping for compatibility
  editingJob,
  mode = "create",
  isOpen: externalIsOpen,
  onClose
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modules, setModules] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setDialogOpen(externalIsOpen);
    }
    if (externalIsOpen) {
      fetchTrainingModules();
    }
  }, [externalIsOpen]);

  const fetchTrainingModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("training_modules")
        .select("id, title")
        .eq("status", "active")
        .order("title");

      if (error) throw error;
      
      // Format modules properly with id and name
      const formattedModules = data ? data.map(module => ({
        id: module.id,
        name: module.title || 'Untitled Module'
      })) : [];
      
      setModules(formattedModules);
    } catch (error: any) {
      toast.error(`Failed to fetch training modules: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setDialogOpen(true);
    fetchTrainingModules();
  };

  const handleClose = () => {
    setDialogOpen(false);
    if (onClose) onClose();
  };

  const handleSubmit = (form: JobFormValues) => {
    if (mode === "edit" && onJobUpdated) {
      onJobUpdated({ 
        ...editingJob, 
        ...form,
        selectedAssessment: form.selectedAssessment === "none" ? null : form.selectedAssessment
      });
    } else if (onJobCreated) {
      const processedForm = {
        ...form,
        selectedAssessment: form.selectedAssessment === "none" ? null : form.selectedAssessment
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
      <DialogContent onEscapeKeyDown={handleClose} onInteractOutside={handleClose} className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
