
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Calendar, ArrowRight } from "lucide-react";

interface DashboardStatsProps {
  totalCandidates: number;
  pendingReviews: number;
  interviewsScheduled: number;
  nextInterviewDate?: string;
  isLoading: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalCandidates,
  pendingReviews,
  interviewsScheduled,
  nextInterviewDate,
  isLoading,
}) => {
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Candidates
              </p>
              <h3 className="text-3xl font-bold mt-1">
                {isLoading ? "..." : totalCandidates}
              </h3>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending Reviews
              </p>
              <h3 className="text-3xl font-bold mt-1">
                {isLoading ? "..." : pendingReviews}
              </h3>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" asChild>
              <Link to="/candidates">
                View pending <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Interviews Scheduled
              </p>
              <h3 className="text-3xl font-bold mt-1">
                {isLoading ? "..." : interviewsScheduled}
              </h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            {nextInterviewDate && (
              <span className="text-xs text-muted-foreground">
                Next: {formatDateTime(nextInterviewDate)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
