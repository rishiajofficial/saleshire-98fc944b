
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  MoreHorizontal,
  FileText,
  Edit,
  Copy,
  Trash2,
  Eye,
  BarChart
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Assessments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newAssessmentTitle, setNewAssessmentTitle] = useState("");
  const [newAssessmentDescription, setNewAssessmentDescription] = useState("");
  const [newAssessmentType, setNewAssessmentType] = useState("screening");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mocked assessments data
  const assessments = [
    {
      id: 1,
      title: "Initial Sales Knowledge",
      description: "Basic assessment of sales knowledge and aptitude",
      type: "Screening",
      questions: 15,
      submissions: 18,
      avgScore: 72,
      lastUpdated: "2023-09-15",
      createdBy: "John Smith"
    },
    {
      id: 2,
      title: "Product Knowledge Quiz",
      description: "Detailed quiz about our products and their features",
      type: "Training",
      questions: 20,
      submissions: 12,
      avgScore: 84,
      lastUpdated: "2023-09-20",
      createdBy: "Sarah Johnson"
    },
    {
      id: 3,
      title: "Sales Techniques Assessment",
      description: "Evaluation of advanced sales techniques and strategies",
      type: "Training",
      questions: 25,
      submissions: 10,
      avgScore: 76,
      lastUpdated: "2023-09-22",
      createdBy: "John Smith"
    },
    {
      id: 4,
      title: "Objection Handling Quiz",
      description: "Scenarios focused on handling customer objections",
      type: "Sales Task",
      questions: 12,
      submissions: 8,
      avgScore: 81,
      lastUpdated: "2023-09-25",
      createdBy: "Sarah Johnson"
    },
    {
      id: 5,
      title: "Final Assessment",
      description: "Comprehensive assessment covering all training modules",
      type: "Final",
      questions: 30,
      submissions: 5,
      avgScore: 79,
      lastUpdated: "2023-09-28",
      createdBy: "John Smith"
    }
  ];

  const filteredAssessments = assessments.filter(assessment => 
    assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteAssessment = (id: number) => {
    toast.success("Assessment deleted successfully");
  };

  const duplicateAssessment = (id: number) => {
    toast.success("Assessment duplicated successfully");
  };

  const handleCreateAssessment = () => {
    if (!newAssessmentTitle) {
      toast.error("Assessment title is required");
      return;
    }
    
    // In a real app, this would send a request to the backend
    toast.success("Assessment created successfully");
    setIsDialogOpen(false);
    setNewAssessmentTitle("");
    setNewAssessmentDescription("");
    setNewAssessmentType("screening");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage assessments for candidate evaluation
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Assessment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Assessment</DialogTitle>
                <DialogDescription>
                  Create a new assessment for candidates to complete.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Assessment Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter assessment title"
                    value={newAssessmentTitle}
                    onChange={(e) => setNewAssessmentTitle(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter assessment description"
                    value={newAssessmentDescription}
                    onChange={(e) => setNewAssessmentDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Assessment Type</Label>
                  <Select
                    value={newAssessmentType}
                    onValueChange={setNewAssessmentType}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="screening">Screening</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="sales_task">Sales Task</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreateAssessment}>
                  Create Assessment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search assessments..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Assessments</CardTitle>
            <CardDescription>
              {filteredAssessments.length} assessments found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Questions</TableHead>
                  <TableHead className="hidden md:table-cell">Submissions</TableHead>
                  <TableHead className="hidden md:table-cell">Avg. Score</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.length > 0 ? (
                  filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{assessment.title}</div>
                          <div className="text-sm text-muted-foreground hidden md:block">
                            {assessment.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{assessment.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {assessment.questions}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {assessment.submissions}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className={assessment.avgScore >= 80 ? "text-green-600" : 
                                        assessment.avgScore >= 70 ? "text-amber-600" : "text-red-600"}>
                          {assessment.avgScore}%
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(assessment.lastUpdated).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/assessments/${assessment.id}`}>
                                <Eye className="h-4 w-4 mr-2" /> View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/assessments/${assessment.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/assessments/${assessment.id}/results`}>
                                <BarChart className="h-4 w-4 mr-2" /> Results
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateAssessment(assessment.id)}>
                              <Copy className="h-4 w-4 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteAssessment(assessment.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                        <h3 className="font-medium text-lg">No assessments found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchTerm ? "Try adjusting your search term" : "Create your first assessment to get started"}
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Assessment
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Assessments;
