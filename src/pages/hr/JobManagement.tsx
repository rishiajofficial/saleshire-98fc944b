import React, { useEffect } from 'react';
import useJobs from '@/hooks/useJobs';
import JobCreationDialog from '@/components/jobs/JobCreationDialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const JobManagementPage = () => {
  const { jobs, loading, error, fetchJobs, createJob, updateJob, deleteJob } = useJobs();
  
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleJobCreated = async (jobData: any) => {
    try {
      await createJob(jobData);
      toast.success("Job created successfully!");
    } catch (err: any) {
      toast.error(`Failed to create job: ${err.message}`);
    } finally {
      fetchJobs();
    }
  };

  const handleJobUpdated = async (jobData: any) => {
    try {
      await updateJob(jobData);
      toast.success("Job updated successfully!");
    } catch (err: any) {
      toast.error(`Failed to update job: ${err.message}`);
    } finally {
      fetchJobs();
    }
  };

  const handleJobDeleted = async (jobId: string) => {
    try {
      await deleteJob(jobId);
      toast.success("Job deleted successfully!");
    } catch (err: any) {
      toast.error(`Failed to delete job: ${err.message}`);
    } finally {
      fetchJobs();
    }
  };

  return (
    <div>
      <h1>Job Management</h1>
      <JobCreationDialog onJobCreated={handleJobCreated} />
      <div>
        {jobs.map(job => (
          <div key={job.id}>
            <h2>{job.title}</h2>
            <p>{job.description}</p>
            <p>Department: {job.department}</p>
            <p>Location: {job.location}</p>
            <p>Employment Type: {job.employment_type}</p>
            <p>Salary Range: {job.salary_range}</p>
            <JobCreationDialog mode="edit" editingJob={job} onJobUpdated={handleJobUpdated} />
            <Button onClick={() => handleJobDeleted(job.id)}>Delete</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobManagementPage;
