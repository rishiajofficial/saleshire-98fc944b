
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle, Trash2, PlayCircle } from "lucide-react";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    location?: string;
    salary_range?: string;
  };
  applicationStatus: { applied: boolean; completed: boolean } | undefined;
  onApply: (jobId: string) => void;
  onWithdraw: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  applicationStatus, 
  onApply, 
  onWithdraw 
}) => {
  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const getApplicationButton = () => {
    if (!applicationStatus?.applied) {
      // No application exists
      return (
        <Button 
          onClick={() => onApply(job.id)} 
          className="w-full sm:w-auto text-sm px-3 py-2 h-8"
          size="sm"
        >
          Apply
        </Button>
      );
    }
    
    if (applicationStatus.applied && !applicationStatus.completed) {
      // Application started but not completed
      return (
        <Button 
          onClick={() => onApply(job.id)} 
          className="w-full sm:w-auto text-sm px-3 py-2 h-8" 
          variant="outline"
          size="sm"
        >
          <PlayCircle className="h-3 w-3 mr-1" />
          <span className="text-xs sm:text-sm">Continue</span>
        </Button>
      );
    }
    
    // Application completed
    return (
      <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1 w-full sm:w-auto justify-center">
        <CheckCircle className="h-3 w-3 mr-1" /> 
        <span>Applied</span>
      </Badge>
    );
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-3">
        {/* Job Content */}
        <div className="space-y-2">
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{job.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-3">
            {truncateText(job.description)}
          </p>
          <div className="space-y-1">
            {job.location && (
              <div className="text-gray-500 text-xs">Location: {job.location}</div>
            )}
            {job.salary_range && (
              <div className="text-gray-500 text-xs">Salary: {job.salary_range}</div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
          {getApplicationButton()}
          
          {applicationStatus?.applied && (
            <Button 
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 text-sm px-3 py-2 h-8"
              onClick={() => onWithdraw(job.id)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              <span className="text-xs sm:text-sm">Withdraw</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
