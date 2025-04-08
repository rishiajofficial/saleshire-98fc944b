
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

const HR = () => {
  // Placeholder data for HR staff
  const hrStaff = [
    { id: "1", name: "HR One", email: "hr1@example.com", department: "Recruitment", status: "active" },
    { id: "2", name: "HR Two", email: "hr2@example.com", department: "Training", status: "active" },
    { id: "3", name: "HR Three", email: "hr3@example.com", department: "Employee Relations", status: "inactive" },
  ];

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">HR Staff</h1>
        <div className="flex space-x-4">
          <Button asChild variant="outline">
            <Link to="/dashboard/admin">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Link>
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add HR Staff
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hrStaff.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{staff.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {staff.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{staff.department}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={staff.status === "active" ? "outline" : "secondary"}
                    className={
                      staff.status === "active"
                        ? "border-green-500 text-green-600"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {staff.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/hr/${staff.id}`}>
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

export default HR;
