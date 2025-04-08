
import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { ArrowLeft, Plus, UserCog } from "lucide-react";

const Directors = () => {
  // Placeholder data for directors
  const directors = [
    { id: "1", name: "Director One", email: "director1@example.com", department: "Sales", region: "North", status: "active" },
    { id: "2", name: "Director Two", email: "director2@example.com", department: "Operations", region: "South", status: "active" },
    { id: "3", name: "Director Three", email: "director3@example.com", department: "Finance", region: "East", status: "inactive" },
  ];

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Directors</h1>
        <div className="flex space-x-4">
          <Button asChild variant="outline">
            <Link to="/dashboard/admin">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Link>
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Director
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {directors.map((director) => (
              <TableRow key={director.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{director.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {director.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{director.department}</TableCell>
                <TableCell>
                  <Badge variant="outline">{director.region}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={director.status === "active" ? "outline" : "secondary"}
                    className={
                      director.status === "active"
                        ? "border-green-500 text-green-600"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {director.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/directors/${director.id}`}>
                      <UserCog className="h-4 w-4 mr-2" /> Manage
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </MainLayout>
  );
};

export default Directors;
