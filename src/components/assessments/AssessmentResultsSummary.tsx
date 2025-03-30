
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface AssessmentResultsSummaryProps {
  assessmentId: string;
}

const AssessmentResultsSummary: React.FC<AssessmentResultsSummaryProps> = ({ assessmentId }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Assessment Results</CardTitle>
          <CardDescription>
            View the results of this assessment
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={`/assessments/results?assessmentId=${assessmentId}`}>
            View All Results
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            View assessment results to see how candidates are performing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentResultsSummary;
