
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PublicJobListings } from '@/components/public/PublicJobListings';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Job } from '@/types/job';

const Careers = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filtered jobs based on search
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.department && job.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    async function fetchPublicJobs() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'active')
          .eq('is_public', true)
          .eq('archived', false)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setJobs(data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPublicJobs();
  }, []);

  return (
    <MainLayout title="Careers">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
            <p className="text-xl text-gray-600 mb-8">
              We're looking for talented individuals to help us build the future of work
            </p>
            
            <div className="flex gap-4 max-w-lg mx-auto mb-8">
              <Input
                type="text"
                placeholder="Search jobs by title, description, or location"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {user ? (
                <Button onClick={() => navigate('/dashboard/candidate')}>
                  My Dashboard
                </Button>
              ) : (
                <Button onClick={() => navigate('/register')}>
                  Apply Now
                </Button>
              )}
            </div>
          </div>

          <PublicJobListings jobs={filteredJobs} loading={loading} />
          
          {!loading && filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-600">
                {searchTerm ? "No matching jobs found" : "No open positions at the moment"}
              </h3>
              <p className="mt-2 text-gray-500">
                {searchTerm ? "Try using different keywords" : "Please check back later for new opportunities"}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Careers;
