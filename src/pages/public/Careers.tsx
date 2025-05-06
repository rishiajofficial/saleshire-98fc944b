
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Job } from "@/types/job";
import { BookOpen, Briefcase, GraduationCap, Search, Star, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PublicJobListings } from "@/components/public/PublicJobListings";

const Careers = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'active')
          .eq('archived', false)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setJobs(data || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleApply = () => {
    navigate("/register");
    toast.info("Create an account to apply for this position");
  };

  const benefits = [
    {
      title: "Job-Specific Training",
      description: "Get trained for the exact skills you'll need on the job before your interview",
      icon: <BookOpen className="h-8 w-8 text-primary" />
    },
    {
      title: "Higher Success Rate",
      description: "Our candidates are 3x more likely to get hired than through traditional applications",
      icon: <TrendingUp className="h-8 w-8 text-primary" />
    },
    {
      title: "Better Starting Salaries",
      description: "Candidates who complete our training receive offers with 15% higher starting salaries",
      icon: <Star className="h-8 w-8 text-primary" />
    },
    {
      title: "Fresh Graduate Friendly",
      description: "No experience? No problem. Our training helps bridge the skills gap for recent grads",
      icon: <GraduationCap className="h-8 w-8 text-primary" />
    }
  ];

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-indigo-50 via-purple-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="mb-4 px-3 py-1 border-indigo-200 bg-indigo-50 text-indigo-700">
              For Job Seekers
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Get Trained, Get Hired
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Our platform trains you for the exact skills companies need, making you the perfect candidate even before your first interview.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600" onClick={() => navigate('/register')}>
                Sign Up Now
              </Button>
              <Button variant="outline" size="lg" onClick={() => document.getElementById('job-listings')?.scrollIntoView({ behavior: 'smooth' })}>
                <Search className="mr-2 h-4 w-4" /> Browse Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Apply Through Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-6">How It Works</h2>
          <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto mb-10">
            Our unique approach helps candidates stand out by combining training and job applications
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-indigo-100 bg-white">
              <CardHeader className="pb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center mb-2">1</div>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Create your candidate profile</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 border-indigo-100 bg-white">
              <CardHeader className="pb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center mb-2">2</div>
                <CardTitle>Apply</CardTitle>
                <CardDescription>Browse jobs and submit applications</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 border-indigo-100 bg-white">
              <CardHeader className="pb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center mb-2">3</div>
                <CardTitle>Train</CardTitle>
                <CardDescription>Complete job-specific training modules</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 border-indigo-100 bg-white">
              <CardHeader className="pb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center mb-2">4</div>
                <CardTitle>Interview</CardTitle>
                <CardDescription>Showcase your new skills and get hired</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        <div id="job-listings" className="pt-10">
          <h2 className="text-3xl font-bold text-center mb-12">Current Job Openings</h2>
          <Tabs defaultValue="all">
            <TabsList className="w-full max-w-md mx-auto mb-8">
              <TabsTrigger value="all" className="flex-1">All Jobs</TabsTrigger>
              <TabsTrigger value="sales" className="flex-1">Sales</TabsTrigger>
              <TabsTrigger value="marketing" className="flex-1">Marketing</TabsTrigger>
              <TabsTrigger value="tech" className="flex-1">Tech</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <PublicJobListings jobs={jobs} isLoading={isLoading} onApply={handleApply} />
            </TabsContent>
            
            <TabsContent value="sales">
              <PublicJobListings 
                jobs={jobs.filter(job => job.department?.toLowerCase() === 'sales')} 
                isLoading={isLoading} 
                onApply={handleApply} 
              />
            </TabsContent>
            
            <TabsContent value="marketing">
              <PublicJobListings 
                jobs={jobs.filter(job => job.department?.toLowerCase() === 'marketing')} 
                isLoading={isLoading} 
                onApply={handleApply} 
              />
            </TabsContent>
            
            <TabsContent value="tech">
              <PublicJobListings 
                jobs={jobs.filter(job => job.department?.toLowerCase() === 'tech' || job.department?.toLowerCase() === 'technology')} 
                isLoading={isLoading} 
                onApply={handleApply} 
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-16 text-center py-10 px-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Career Journey?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Join thousands of candidates who have accelerated their careers through our unique training and application platform.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600" onClick={() => navigate('/register')}>
            <Users className="mr-2 h-5 w-5" /> Create Your Profile Today
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Careers;
