
import React from "react";
import { Job } from "@/types/job";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/ui/loading";

interface PublicJobListingsProps {
  jobs: Job[];
  isLoading: boolean;
  onApply: (jobId: string) => void;
  isPublic?: boolean;
}

export const PublicJobListings: React.FC<PublicJobListingsProps> = ({ 
  jobs, 
  isLoading,
  onApply,
  isPublic = true
}) => {
  // Filter to only show public jobs on the public page
  const displayJobs = isPublic ? jobs.filter(job => job.is_public) : jobs;

  if (isLoading) {
    return <Loading message="Loading job openings..." />;
  }

  if (!displayJobs || displayJobs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Briefcase className="h-12 w-12 text-gray-400" />
          <h3 className="text-xl font-medium text-gray-700">No open positions found</h3>
          <p className="text-gray-500">
            There are currently no job openings available in this category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {displayJobs.map((job) => (
        <Card key={job.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">{job.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    {job.department && (
                      <span className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.department}
                      </span>
                    )}
                    {job.location && (
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </span>
                    )}
                    {job.employment_type && (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {job.employment_type}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  {job.salary_range && (
                    <div className="text-indigo-600 font-semibold flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {job.salary_range}
                    </div>
                  )}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <p className="text-gray-600 line-clamp-2 mb-4">
                {job.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {job.employment_type && (
                  <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
                    {job.employment_type}
                  </span>
                )}
                <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full">
                  Training Available
                </span>
                {job.is_public && (
                  <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                    Public Listing
                  </span>
                )}
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button onClick={() => onApply(job.id)}>
                  Apply Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
