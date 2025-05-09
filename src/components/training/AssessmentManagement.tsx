import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/auth';
import { Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Assessment } from "@/types/training";
import { AssessmentList } from "./AssessmentList";

const AssessmentManagement = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .order("title");

      if (error) throw error;
      setAssessments(data || []);
    } catch (error: any) {
      toast.error(`Failed to fetch assessments: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessmentModules = async (assessmentId: string) => {
    try {
      // Use direct query instead of RPC
      const { count, error } = await supabase
        .from("module_assessments")
        .select('id', { count: 'exact', head: true })
        .eq("assessment_id", assessmentId);
      
      if (error) throw error;
      
      return count || 0;
    } catch (error: any) {
      console.error('Error fetching assessment modules:', error);
      toast.error('Failed to fetch assessment modules');
      return 0; // Return 0 if there's an error
    }
  };

  const handleCreateAssessment = () => {
    console.log("Navigating to assessment creation page");
    navigate("/assessments/create");
  };

  const handleEditAssessment = (assessment: Assessment) => {
    navigate(`/assessments/${assessment.id}/edit`);
  };

  const handleOpenDeleteDialog = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setShowDeleteDialog(true);
  };

  const handleDeleteAssessment = async () => {
    try {
      if (!selectedAssessment) return;

      // Check if assessment is used in any modules 
      const moduleCount = await fetchAssessmentModules(selectedAssessment.id);
      
      if (moduleCount > 0) {
        toast.error("Cannot delete assessment as it is used in one or more training modules");
        setShowDeleteDialog(false);
        return;
      }

      const { error: deleteError } = await supabase
        .from("assessments")
        .delete()
        .eq("id", selectedAssessment.id);

      if (deleteError) throw deleteError;

      toast.success("Assessment deleted successfully");
      setShowDeleteDialog(false);
      fetchAssessments();
    } catch (error: any) {
      toast.error(`Failed to delete assessment: ${error.message}`);
    }
  };

  const handleViewAssessment = (assessment: Assessment) => {
    navigate(`/assessments/${assessment.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Assessment Management</h2>
        <Button onClick={handleCreateAssessment}>
          <Plus className="mr-2 h-4 w-4" /> Create Assessment
        </Button>
      </div>

      <AssessmentList 
        assessments={assessments} 
        onEdit={handleEditAssessment} 
        onDelete={handleOpenDeleteDialog}
        onView={handleViewAssessment}
      />

      {/* Delete Assessment Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the assessment "{selectedAssessment?.title}"?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAssessment}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssessmentManagement;
