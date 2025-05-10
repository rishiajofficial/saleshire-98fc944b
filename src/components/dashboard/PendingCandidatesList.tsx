
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Clock } from "lucide-react";

interface PendingCandidatesListProps {
  candidates: any[];
  isLoading: boolean;
  role: string;
}

const PendingCandidatesList: React.FC<PendingCandidatesListProps> = ({
  candidates,
  isLoading,
  role,
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              Pending Candidates
            </CardTitle>
            <CardDescription>
              Candidates who have created profiles but haven't applied to any jobs yet.
            </CardDescription>
          </div>
          <Button size="sm" className="h-8" asChild>
            <Link to="/candidates">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Loading candidates...
                  </TableCell>
                </TableRow>
              ) : candidates && candidates.length > 0 ? (
                candidates.slice(0, 5).map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-2">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {candidate.profile?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {candidate.profile?.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{formatDate(candidate.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/candidates/${candidate.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No pending candidates
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingCandidatesList;
