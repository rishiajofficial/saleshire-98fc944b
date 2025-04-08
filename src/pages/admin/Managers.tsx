
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

const Managers = () => {
  // Placeholder data for managers
  const managers = [
    { id: "1", name: "Manager One", email: "manager1@example.com", region: "North", candidatesAssigned: 12, status: "active" },
    { id: "2", name: "Manager Two", email: "manager2@example.com", region: "South", candidatesAssigned: 8, status: "active" },
    { id: "3", name: "Manager Three", email: "manager3@example.com", region: "East", candidatesAssigned: 5, status: "inactive" },
  ];

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Managers</h1>
        <div className="flex space-x-4">
          <Button asChild variant="outline">
            <Link to="/dashboard/admin">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Link>
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Manager
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Candidates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managers.map((manager) => (
              <TableRow key={manager.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{manager.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {manager.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{manager.region}</Badge>
                </TableCell>
                <TableCell>{manager.candidatesAssigned} assigned</TableCell>
                <TableCell>
                  <Badge
                    variant={manager.status === "active" ? "outline" : "secondary"}
                    className={
                      manager.status === "active"
                        ? "border-green-500 text-green-600"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {manager.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/managers/${manager.id}`}>
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

export default Managers;
