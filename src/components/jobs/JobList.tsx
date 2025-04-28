import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, PencilLine, Eye, ArchiveIcon, Users2 } from "lucide-react";
import { Job } from "@/types/job";
import JobCreationDialog from "./JobCreationDialog";
import { JobApplicationsDialog } from "./JobApplicationsDialog";
import { DeleteJobDialog } from "./DeleteJobDialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";

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

interface JobListProps {
  jobs: Job[];
  onJobDeleted: (jobId: string) => void;
  onJobUpdated: (job: any) => void;
  onJobArchived: (jobId: string, archived: boolean) => void;
  assessments: { id: string; title: string }[];
  categories: { id: string; name: string }[];
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  onJobDeleted,
  onJobUpdated,
  onJobArchived,
  assessments,
  categories
}) => {
  const [selectedJob, setSelectedJob] = useState<EditingJob | null>(null);
  const [viewMode, setViewMode] = useState<"view" | "edit" | null>(null);
  const [showApplications, setShowApplications] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [filter, setFilter] = useState<"active" | "archived">("active");

  const filteredJobs = jobs.filter(job => job.archived === (filter === "archived"));

  const fetchJobRelatedData = async (job: Job): Promise<EditingJob> => {
    const { data: assessmentData } = await supabase
      .from('job_assessments')
      .select('assessment_id')
      .eq('job_id', job.id)
      .maybeSingle();
    
    const { data: trainingData } = await supabase
      .from('job_training')
      .select('training_module_id')
      .eq('job_id', job.id);
      
    const { data: categoriesData } = await supabase
      .from('job_categories')
      .select('category_id')
      .eq('job_id', job.id);
      
    const selectedModules = trainingData?.map(item => item.training_module_id) || [];
    const selectedCategories = (categoriesData || []).map(item => item.category_id);
    
    return {
      ...job,
      selectedAssessment: assessmentData?.assessment_id || "none",
      selectedModules: selectedModules,
      department: job.department || "",
      location: job.location || "",
      employment_type: job.employment_type || "",
      salary_range: job.salary_range || ""
    };
  };

  const handleViewOrEdit = async (job: Job, mode: "view" | "edit") => {
    try {
      const enhancedJob = await fetchJobRelatedData(job);
      setSelectedJob(enhancedJob);
      setViewMode(mode);
    } catch (error) {
      console.error("Error fetching job related data:", error);
    }
  };

  const dummyOnJobCreated = () => {
    console.log("This function is not used for view/edit dialogs");
  };

  return (
    <div className="space-y-4">
      <ToggleGroup type="single" value={filter} onValueChange={(value: "active" | "archived") => setFilter(value)}>
        <ToggleGroupItem value="active">Active Jobs</ToggleGroupItem>
        <ToggleGroupItem value="archived">Archived Jobs</ToggleGroupItem>
      </ToggleGroup>

      <div className="grid gap-6">
        {filteredJobs.map((job) => (
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApplications(job.id)}
                  >
                    <Users2 className="h-4 w-4 mr-1" /> Applications
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewOrEdit(job, "view")}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewOrEdit(job, "edit")}
                  >
                    <PencilLine className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onJobArchived(job.id, !job.archived)}
                  >
                    <ArchiveIcon className="h-4 w-4 mr-1" />
                    {job.archived ? 'Unarchive' : 'Archive'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setShowDeleteDialog(job.id)}
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

      {selectedJob && viewMode && (
        <JobCreationDialog
          mode={viewMode}
          editingJob={selectedJob}
          assessments={assessments}
          categories={categories}
          onJobCreated={dummyOnJobCreated}
          onJobUpdated={onJobUpdated}
          isOpen={true}
          onClose={() => {
            setSelectedJob(null);
            setViewMode(null);
          }}
        />
      )}

      <JobApplicationsDialog
        jobId={showApplications || ''}
        isOpen={!!showApplications}
        onClose={() => setShowApplications(null)}
      />

      <DeleteJobDialog
        isOpen={!!showDeleteDialog}
        onClose={() => setShowDeleteDialog(null)}
        onConfirm={() => {
          if (showDeleteDialog) {
            onJobDeleted(showDeleteDialog);
            setShowDeleteDialog(null);
          }
        }}
      />
    </div>
  );
};

export default JobList;
