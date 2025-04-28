
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Clock, FileText } from "lucide-react";
import { Assessment } from '@/types/training';

interface AssessmentListProps {
  assessments: Assessment[];
  onEdit: (assessment: Assessment) => void;
  onDelete: (assessment: Assessment) => void;
  onView: (assessment: Assessment) => void;
}

export const AssessmentList = ({ assessments, onEdit, onDelete, onView }: AssessmentListProps) => {
  return (
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
                  onClick={() => onEdit(assessment)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(assessment)}
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
                {assessment.timeLimit ? `${assessment.timeLimit} minutes` : "No time limit"}
              </span>
              <span>Difficulty: {assessment.difficulty || "Not specified"}</span>
            </div>
            <Button 
              variant="link" 
              className="px-0 mt-2" 
              onClick={() => onView(assessment)}
            >
              <FileText className="h-4 w-4 mr-1" /> View Questions
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
