
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Edit, Trash2, Clock, FileText } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  time_limit: number | null;
  created_at: string;
  updated_at: string;
}

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
      // Use a standard join to check if an assessment is used in modules
      const { data, error } = await supabase
        .from("module_assessments")
        .select("module_id")
        .eq("assessment_id", assessmentId);

      if (error) throw error;
      
      // Return the count of related modules
      return data ? data.length : 0;
    } catch (error: any) {
      console.error('Error fetching assessment modules:', error);
      toast.error('Failed to fetch assessment modules');
      return 0; // Return 0 if there's an error
    }
  };

  const handleCreateAssessment = () => {
    navigate("/admin/assessment/create");
  };

  const handleEditAssessment = (assessment: Assessment) => {
    navigate(`/admin/assessment/${assessment.id}/edit`);
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
    navigate(`/admin/assessment/${assessment.id}`);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="truncate">{assessment.title}</span>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAssessment(assessment)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDeleteDialog(assessment)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                {assessment.description || "No description"}
              </p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {assessment.time_limit ? `${assessment.time_limit} minutes` : "No time limit"}
                </span>
                <span>Difficulty: {assessment.difficulty || "Not specified"}</span>
              </div>
              <Button 
                variant="link" 
                className="px-0 mt-2" 
                onClick={() => handleViewAssessment(assessment)}
              >
                <FileText className="h-4 w-4 mr-1" /> View Questions
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {assessments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No assessments found</p>
          <p className="text-sm mt-2">Create your first assessment to get started</p>
        </div>
      )}

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
