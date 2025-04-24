
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Candidate } from '@/types/candidate';

interface ProjectStatusSectionProps {
  candidate: Candidate | null;
  projectStatus: 'not_started' | 'assigned' | 'completed_success' | 'rejected' | 'failed';
  isUpdatingProject: boolean;
  onAssignProject: () => void;
  onUpdateProjectOutcome: (outcome: 'completed_success' | 'rejected' | 'failed') => void;
}

export const ProjectStatusSection = ({
  candidate,
  projectStatus,
  isUpdatingProject,
  onAssignProject,
  onUpdateProjectOutcome
}: ProjectStatusSectionProps) => {
  if (!candidate) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Status</CardTitle>
        <CardDescription>
          Manage candidate's project assignment and outcomes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {projectStatus === 'not_started' && (
          <Button onClick={onAssignProject} disabled={isUpdatingProject}>
            {isUpdatingProject ? "Assigning..." : "Assign Project"}
          </Button>
        )}
        {projectStatus === 'assigned' && (
          <div className="space-x-4">
            <Button 
              variant="default"
              onClick={() => onUpdateProjectOutcome('completed_success')}
              disabled={isUpdatingProject}
            >
              Mark as Completed
            </Button>
            <Button 
              variant="destructive"
              onClick={() => onUpdateProjectOutcome('rejected')}
              disabled={isUpdatingProject}
            >
              Mark as Failed
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
