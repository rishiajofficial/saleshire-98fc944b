
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, PencilLine, Eye } from "lucide-react";
import { Job } from "@/types/job";
import JobCreationDialog from "./JobCreationDialog";
import { supabase } from "@/integrations/supabase/client";

interface JobListProps {
  jobs: Job[];
  onJobDeleted: (jobId: string) => void;
  onJobUpdated: (job: any) => void;
  assessments: { id: string; title: string }[];
  trainingModules: { id: string; title: string }[];
  categories: { id: string; name: string }[];
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  onJobDeleted,
  onJobUpdated,
  assessments,
  trainingModules,
  categories
}) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewMode, setViewMode] = useState<"view" | "edit" | null>(null);

  // Fetch job-related assessment, training modules and categories
  const fetchJobRelatedData = async (job: Job) => {
    // Fetch assessment
    const { data: assessmentData } = await supabase
      .from('job_assessments')
      .select('assessment_id')
      .eq('job_id', job.id)
      .maybeSingle();
    
    // Fetch training module
    const { data: trainingData } = await supabase
      .from('job_training')
      .select('training_module_id')
      .eq('job_id', job.id)
      .maybeSingle();
      
    // Fetch categories 
    const { data: categoriesData } = await supabase
      .from('job_categories')
      .select('category_id')
      .eq('job_id', job.id);
      
    const selectedCategories = (categoriesData || []).map(item => item.category_id);
    
    // Return enhanced job object with assessment, training module IDs and categories
    return {
      ...job,
      selectedAssessment: assessmentData?.assessment_id || "none",
      selectedTrainingModule: trainingData?.training_module_id || "none",
      selectedCategories: selectedCategories || []
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

      {/* View/Edit Dialog */}
      {selectedJob && viewMode && (
        <JobCreationDialog
          mode={viewMode}
          editingJob={selectedJob}
          assessments={assessments}
          trainingModules={trainingModules}
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
    </div>
  );
};

export default JobList;
