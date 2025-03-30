
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useDatabaseQuery from "@/hooks/useDatabaseQuery";
import Loading from "@/components/ui/loading";
import ErrorMessage from "@/components/ui/error-message";
import { BarChart3, Award, Users, Clock } from "lucide-react";

interface AssessmentStatsProps {
  assessmentId: string;
}

const AssessmentStats: React.FC<AssessmentStatsProps> = ({ assessmentId }) => {
  // Fetch assessment results for this specific assessment
  const { 
    data: results, 
    isLoading, 
    error 
  } = useDatabaseQuery<any[]>(
    'assessment_results',
    { 
      filter: { assessment_id: assessmentId },
      columns: '*'
    }
  );

  if (isLoading) {
    return <Loading message="Loading statistics..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Error Loading Statistics"
        message={error.message}
        icon={<BarChart3 className="h-6 w-6 text-red-600" />}
      />
    );
  }

  // Calculate statistics
  const calculateStats = () => {
    if (!results || results.length === 0) {
      return {
        totalAttempts: 0,
        completionRate: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        averageTimeMinutes: 0
      };
    }

    const completedResults = results.filter(result => result.completed);
    
    // Calculate completion rate
    const completionRate = Math.round((completedResults.length / results.length) * 100);
    
    // Calculate scores
    const scores = completedResults
      .map(result => Number(result.score))
      .filter(score => !isNaN(score));
    
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) 
      : 0;
    
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    // Calculate average time (if start and completion times are available)
    let totalTimeMinutes = 0;
    let timeDataCount = 0;

    completedResults.forEach(result => {
      if (result.started_at && result.completed_at) {
        const startTime = new Date(result.started_at);
        const endTime = new Date(result.completed_at);
        const timeInMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
        if (!isNaN(timeInMinutes) && timeInMinutes > 0) {
          totalTimeMinutes += timeInMinutes;
          timeDataCount++;
        }
      }
    });

    const averageTimeMinutes = timeDataCount > 0 
      ? Math.round(totalTimeMinutes / timeDataCount) 
      : 0;

    return {
      totalAttempts: results.length,
      completionRate,
      averageScore,
      highestScore,
      lowestScore,
      averageTimeMinutes
    };
  };

  const stats = calculateStats();

  // Helper function to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  // Helper function for descriptive rating
  const getScoreRating = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Satisfactory";
    if (score >= 50) return "Needs Improvement";
    return "Poor";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Statistics</CardTitle>
        <CardDescription>
          Performance metrics and completion statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.totalAttempts === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No attempts have been recorded for this assessment yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Attempts */}
              <div className="p-4 bg-muted/50 rounded-md">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-primary mr-2" />
                  <h4 className="font-medium">Total Attempts</h4>
                </div>
                <p className="text-2xl font-semibold">
                  {stats.totalAttempts}
                </p>
              </div>
              
              {/* Completion Rate */}
              <div className="p-4 bg-muted/50 rounded-md">
                <div className="flex items-center mb-2">
                  <Award className="h-5 w-5 text-primary mr-2" />
                  <h4 className="font-medium">Completion Rate</h4>
                </div>
                <p className="text-2xl font-semibold">
                  {stats.completionRate}%
                </p>
                <Progress value={stats.completionRate} className="h-2 mt-2" />
              </div>
              
              {/* Average Score */}
              <div className="p-4 bg-muted/50 rounded-md">
                <div className="flex items-center mb-2">
                  <BarChart3 className="h-5 w-5 text-primary mr-2" />
                  <h4 className="font-medium">Average Score</h4>
                </div>
                <p className={`text-2xl font-semibold ${getScoreColor(stats.averageScore)}`}>
                  {stats.averageScore}%
                </p>
                <Badge variant="outline" className="mt-1">
                  {getScoreRating(stats.averageScore)}
                </Badge>
              </div>
              
              {/* Average Time */}
              <div className="p-4 bg-muted/50 rounded-md">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  <h4 className="font-medium">Avg. Completion Time</h4>
                </div>
                <p className="text-2xl font-semibold">
                  {stats.averageTimeMinutes} min
                </p>
              </div>
            </div>
            
            {/* Score Distribution */}
            <div className="space-y-4">
              <h4 className="font-medium">Score Range</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lowest</p>
                  <p className={`font-medium ${getScoreColor(stats.lowestScore)}`}>
                    {stats.lowestScore}%
                  </p>
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-2 bg-muted rounded-full relative">
                    <div 
                      className="absolute h-4 w-4 bg-primary rounded-full top-1/2 transform -translate-y-1/2 -ml-2"
                      style={{ 
                        left: `${stats.averageScore}%`,
                        backgroundColor: getScoreColor(stats.averageScore).replace('text-', '')
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Highest</p>
                  <p className={`font-medium ${getScoreColor(stats.highestScore)}`}>
                    {stats.highestScore}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssessmentStats;
