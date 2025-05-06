
// Since this file wasn't in the allowed files list, we need to create it:
import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RecentResultsList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Assessment Results</CardTitle>
        <CardDescription>Latest assessment completions and scores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          No recent results available
        </div>
        <Button variant="ghost" size="sm" asChild className="w-full mt-2">
          <Link to="/assessments">View All Results</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecentResultsList;
