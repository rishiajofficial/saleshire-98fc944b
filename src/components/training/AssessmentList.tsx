
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Clock, FileText, ArchiveIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Assessment } from "@/types/training";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface AssessmentListProps {
  assessments: Assessment[];
  onEdit: (assessment: Assessment) => void;
  onDelete: (assessment: Assessment) => void;
  onView: (assessment: Assessment) => void;
}

export const AssessmentList: React.FC<AssessmentListProps> = ({ 
  assessments, 
  onEdit, 
  onDelete,
  onView 
}) => {
  const [filter, setFilter] = useState<"active" | "archived">("active");
  
  const filteredAssessments = assessments.filter(assessment => assessment.archived === (filter === "archived"));
  
  const handleArchiveAssessment = async (assessment: Assessment) => {
    try {
      const { error } = await supabase
        .from("assessments")
        .update({ archived: !assessment.archived })
        .eq("id", assessment.id);
        
      if (error) throw error;
      
      toast.success(`Assessment ${assessment.archived ? "unarchived" : "archived"} successfully`);
      // Reload the page to refresh the assessment list
      window.location.reload();
    } catch (error: any) {
      toast.error(`Failed to update assessment: ${error.message}`);
    }
  };
  
  return (
    <div>
      <ToggleGroup type="single" value={filter} onValueChange={(value: "active" | "archived") => setFilter(value)} className="mb-4">
        <ToggleGroupItem value="active">Active Assessments</ToggleGroupItem>
        <ToggleGroupItem value="archived">Archived Assessments</ToggleGroupItem>
      </ToggleGroup>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssessments.map((assessment) => (
          <Card key={assessment.id}>
            <CardHeader className="pb-2">
              <CardTitle>{assessment.title}</CardTitle>
              <CardDescription className="line-clamp-2">{assessment.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                {assessment.topic && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{assessment.topic}</span>
                  </div>
                )}
                {assessment.time_limit && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{assessment.time_limit} min</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                {assessment.difficulty && (
                  <Badge variant={
                    assessment.difficulty.toLowerCase() === 'easy' ? 'outline' : 
                    assessment.difficulty.toLowerCase() === 'medium' ? 'secondary' : 
                    'destructive'
                  }>
                    {assessment.difficulty}
                  </Badge>
                )}
                
                <div className="text-xs text-gray-500">
                  {assessment.created_at && new Date(assessment.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => onView(assessment)}>
                <Eye className="h-4 w-4 mr-1" /> View
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(assessment)}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleArchiveAssessment(assessment)}>
                <ArchiveIcon className="h-4 w-4 mr-1" /> {assessment.archived ? "Unarchive" : "Archive"}
              </Button>
              <Button variant="outline" size="sm" className="text-red-500" onClick={() => onDelete(assessment)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredAssessments.length === 0 && (
        <div className="text-center py-8 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No {filter} assessments found</p>
        </div>
      )}
    </div>
  );
};
