
import React from 'react';
import { useJobOpenings } from '@/hooks/useJobOpenings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';

const Careers = () => {
  const { jobs, isLoading, error } = useJobOpenings();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">Error loading job openings. Please try again later.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Career Opportunities</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.filter(job => job.is_public && job.status === 'open').map((job) => (
              <Card key={job.id} className="shadow hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription>{job.department}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{job.location}</Badge>
                    <Badge variant="outline">{job.employment_type}</Badge>
                  </div>
                  <p className="text-gray-600 line-clamp-3">{job.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button>Apply Now</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {jobs.filter(job => job.is_public && job.status === 'open').length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No open positions at the moment</h3>
              <p className="text-gray-500">Please check back later for new opportunities.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Careers;
