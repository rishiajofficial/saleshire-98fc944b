
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle, Trash2 } from "lucide-react";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    location?: string;
    salary_range?: string;
  };
  hasApplied: boolean;
  onApply: (jobId: string) => void;
  onWithdraw: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  hasApplied, 
  onApply, 
  onWithdraw 
}) => {
  return (
    <Card key={job.id} className="p-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-lg">{job.title}</div>
          <div className="text-gray-600 text-sm">{job.description}</div>
          {job.location && (
            <div className="text-gray-500 text-xs mt-1">Location: {job.location}</div>
          )}
          {job.salary_range && (
            <div className="text-gray-500 text-xs">Salary: {job.salary_range}</div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {hasApplied ? (
            <>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" /> Applied
              </Badge>
              <Button 
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                onClick={() => onWithdraw(job.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Withdraw
              </Button>
            </>
          ) : (
            <Button onClick={() => onApply(job.id)}>
              Apply
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
