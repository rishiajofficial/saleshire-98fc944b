
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AssessmentResult } from '@/types/candidate';

interface AssessmentResultsSectionProps {
  assessmentResults: AssessmentResult[] | undefined;
  isLoadingResults: boolean;
  formatDate: (date: string) => string;
}

export const AssessmentResultsSection = ({
  assessmentResults,
  isLoadingResults,
  formatDate
}: AssessmentResultsSectionProps) => {
  if (isLoadingResults) {
    return <div>Loading assessment results...</div>;
  }

  if (!assessmentResults?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment Results</CardTitle>
          <CardDescription>
            No assessment results available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This candidate has not completed any assessments yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Results</CardTitle>
        <CardDescription>
          View candidate's assessment performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assessmentResults.map((result) => (
            <div key={result.id} className="border p-4 rounded-md">
              <h4 className="font-semibold">
                {result.assessment?.title || 'Untitled Assessment'}
              </h4>
              <p>Score: {result.score}%</p>
              <p>Completed: {formatDate(result.completed_at || '')}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
