import React from "react";
import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PublicJobListingsProps {
  jobs: Job[];
  isLoading?: boolean;  // Changed from loading to isLoading
  onApply?: (job: Job) => void;
}

const PublicJobListings: React.FC<PublicJobListingsProps> = ({ jobs, isLoading, onApply }) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <p>Loading job listings...</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center">
        <Input
          type="text"
          placeholder="Search job listings..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="mr-2"
        />
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="grid gap-4">
        {filteredJobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{job.description}</p>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={() => onApply && onApply(job)}>Apply Now</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PublicJobListings;
