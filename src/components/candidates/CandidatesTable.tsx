
import React from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { CandidateWithProfile } from "@/types/candidate";

interface CandidatesTableProps {
  candidates: CandidateWithProfile[];
  isLoading: boolean;
  error: Error | null;
  userRole?: string;
  onDelete: (id: string) => void;
}

export const CandidatesTable: React.FC<CandidatesTableProps> = ({
  candidates,
  isLoading,
  error,
  userRole,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center py-8">
          Loading candidates...
        </TableCell>
      </TableRow>
    );
  }

  if (error) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center py-8 text-red-600">
          Error: {error.message}
        </TableCell>
      </TableRow>
    );
  }

  if (candidates.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center py-8">
          <p className="text-muted-foreground">No candidates found.</p>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="hidden md:table-cell">Phone</TableHead>
          <TableHead className="hidden md:table-cell">Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => (
          <TableRow key={candidate.id}>
            <TableCell>{candidate.profile?.name || "Unknown"}</TableCell>
            <TableCell>{candidate.profile?.email || "Unknown"}</TableCell>
            <TableCell className="hidden md:table-cell">
              {candidate.phone || "N/A"}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {candidate.location || "N/A"}
            </TableCell>
            <TableCell>{candidate.status || "Unknown"}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-1">
                {(userRole === "hr" ||
                  userRole === "admin" ||
                  userRole === "manager") && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="View Details"
                      className="h-8 w-8 text-gray-700 hover:text-blue-600"
                      asChild
                    >
                      <Link to={`/candidates/${candidate.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit"
                      className="h-8 w-8 text-gray-700 hover:text-blue-600"
                      asChild
                    >
                      <Link to={`/candidates/${candidate.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(candidate.id)}
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
