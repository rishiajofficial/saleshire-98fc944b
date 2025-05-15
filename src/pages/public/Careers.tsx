import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Building, Clock, Briefcase } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { useJobOpenings } from "@/hooks/useJobOpenings";

const Careers = () => {
  const { jobs, isLoading } = useJobOpenings();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!jobs) return;

    let filtered = [...jobs];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(term) ||
          job.company_name.toLowerCase().includes(term) ||
          job.location.toLowerCase().includes(term) ||
          job.description.toLowerCase().includes(term)
      );
    }

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((job) => job.job_type === activeTab);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, activeTab]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover exciting career opportunities and be part of our growing
            team. We're looking for talented individuals to help us shape the
            future.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for jobs by title, location, or keywords..."
              className="pl-10"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={handleTabChange}
            className="mb-8"
          >
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All Jobs</TabsTrigger>
              <TabsTrigger value="full-time">Full-time</TabsTrigger>
              <TabsTrigger value="part-time">Part-time</TabsTrigger>
              <TabsTrigger value="contract">Contract</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredJobs && filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Building className="h-4 w-4 mr-1" />
                          {job.company_name}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          job.job_type === "full-time"
                            ? "default"
                            : job.job_type === "part-time"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {job.job_type === "full-time"
                          ? "Full-time"
                          : job.job_type === "part-time"
                          ? "Part-time"
                          : "Contract"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.experience_level}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Posted {formatDate(job.created_at)}
                      </div>
                    </div>
                    <p className="line-clamp-3">{job.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="text-sm">
                      <span className="font-medium">
                        {job.salary_range || "Competitive salary"}
                      </span>
                    </div>
                    <Button asChild>
                      <Link to={`/login?apply=${job.id}`}>Apply Now</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No jobs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or check back later for new
                opportunities.
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Careers;
