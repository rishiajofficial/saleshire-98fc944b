
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ListTodo } from "lucide-react";
import { Assessment } from '@/types/training';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AssessmentListProps {
  assessments: Assessment[];
  onEdit: (assessment: Assessment) => void;
  onDelete: (assessment: Assessment) => void;
  onView: (assessment: Assessment) => void;
}

export const AssessmentList = ({ assessments, onEdit, onDelete, onView }: AssessmentListProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        {assessments.map((assessment, index) => (
          <React.Fragment key={assessment.id}>
            {index > 0 && <Separator className="my-4" />}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <ListTodo className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">{assessment.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {assessment.description || "No description"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {assessment.difficulty || "Standard"}
                      </Badge>
                      {assessment.timeLimit && (
                        <Badge variant="outline">
                          {assessment.timeLimit} minutes
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(assessment)}
                >
                  View
                </Button>
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
            </div>
          </React.Fragment>
        ))}
        
        {assessments.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No assessments found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
