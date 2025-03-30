
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Save, AlertCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AssessmentDetails = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [newSection, setNewSection] = useState({ title: "", description: "" });
  const [showNewSectionDialog, setShowNewSectionDialog] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (assessmentId) {
      loadAssessment();
      loadSections();
      loadResults();
    }
  }, [assessmentId]);

  const loadAssessment = async () => {
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", assessmentId)
        .single();

      if (error) throw error;
      setAssessment(data);
    } catch (error: any) {
      console.error("Error loading assessment:", error.message);
      toast.error("Failed to load assessment details");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from("assessment_sections")
        .select(`
          *,
          questions:questions(*)
        `)
        .eq("assessment_id", assessmentId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error: any) {
      console.error("Error loading sections:", error.message);
      toast.error("Failed to load assessment sections");
    }
  };

  const loadResults = async () => {
    try {
      const { data, error } = await supabase
        .from("assessment_results")
        .select(`
          *,
          candidate:profiles!assessment_results_candidate_id_fkey(id, name, email)
        `)
        .eq("assessment_id", assessmentId)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error: any) {
      console.error("Error loading results:", error.message);
      toast.error("Failed to load assessment results");
    }
  };

  const handleUpdateAssessment = async () => {
    if (!assessment) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("assessments")
        .update({
          title: assessment.title,
          description: assessment.description,
          difficulty: assessment.difficulty,
          time_limit: assessment.time_limit,
          randomize_questions: assessment.randomize_questions,
          prevent_backtracking: assessment.prevent_backtracking
        })
        .eq("id", assessmentId);

      if (error) throw error;
      toast.success("Assessment updated successfully");
    } catch (error: any) {
      console.error("Error updating assessment:", error.message);
      toast.error("Failed to update assessment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSection = async () => {
    try {
      if (!newSection.title) {
        toast.error("Section title is required");
        return;
      }

      const { data, error } = await supabase
        .from("assessment_sections")
        .insert({
          assessment_id: assessmentId,
          title: newSection.title,
          description: newSection.description
        })
        .select()
        .single();

      if (error) throw error;
      
      setSections([...sections, {...data, questions: []}]);
      setNewSection({ title: "", description: "" });
      setShowNewSectionDialog(false);
      toast.success("Section added successfully");
    } catch (error: any) {
      console.error("Error creating section:", error.message);
      toast.error("Failed to create section");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      const { error } = await supabase
        .from("assessment_sections")
        .delete()
        .eq("id", sectionId);

      if (error) throw error;
      
      setSections(sections.filter(section => section.id !== sectionId));
      toast.success("Section deleted successfully");
    } catch (error: any) {
      console.error("Error deleting section:", error.message);
      toast.error("Failed to delete section");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-lg text-muted-foreground">Loading assessment details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!assessment) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Assessment Not Found</h2>
          <p className="text-muted-foreground mb-6">The assessment you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button asChild>
            <Link to="/assessments">Go to Assessments</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{assessment.title}</h1>
            <p className="text-muted-foreground mt-1">
              {assessment.description || "No description provided"}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link to="/assessments">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Assessments
              </Link>
            </Button>
            <Button onClick={handleUpdateAssessment} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Assessment Details</TabsTrigger>
            <TabsTrigger value="sections">Sections & Questions</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Information</CardTitle>
                <CardDescription>
                  Edit the basic information for this assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <Input 
                      id="title" 
                      value={assessment.title} 
                      onChange={(e) => setAssessment({...assessment, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">Description</label>
                    <Textarea 
                      id="description" 
                      rows={4}
                      value={assessment.description || ""} 
                      onChange={(e) => setAssessment({...assessment, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="difficulty" className="text-sm font-medium">Difficulty</label>
                      <select
                        id="difficulty"
                        className="w-full px-3 py-2 border rounded-md"
                        value={assessment.difficulty || "medium"}
                        onChange={(e) => setAssessment({...assessment, difficulty: e.target.value})}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="time_limit" className="text-sm font-medium">
                        Time Limit (minutes, 0 for no limit)
                      </label>
                      <Input 
                        id="time_limit" 
                        type="number" 
                        min="0"
                        value={assessment.time_limit || 0} 
                        onChange={(e) => setAssessment({
                          ...assessment, 
                          time_limit: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="randomize_questions"
                        className="h-4 w-4"
                        checked={!!assessment.randomize_questions}
                        onChange={(e) => setAssessment({
                          ...assessment, 
                          randomize_questions: e.target.checked
                        })}
                      />
                      <label htmlFor="randomize_questions" className="text-sm font-medium">
                        Randomize Questions Order
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="prevent_backtracking"
                        className="h-4 w-4"
                        checked={!!assessment.prevent_backtracking}
                        onChange={(e) => setAssessment({
                          ...assessment, 
                          prevent_backtracking: e.target.checked
                        })}
                      />
                      <label htmlFor="prevent_backtracking" className="text-sm font-medium">
                        Prevent Going Back to Previous Questions
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-4 py-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Sections</h2>
              <Button onClick={() => setShowNewSectionDialog(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Section
              </Button>
            </div>

            {sections.length === 0 ? (
              <div className="bg-muted p-8 rounded-lg text-center">
                <p className="text-lg font-medium mb-2">No Sections Yet</p>
                <p className="text-muted-foreground mb-6">
                  Add sections to organize your assessment questions
                </p>
                <Button onClick={() => setShowNewSectionDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Section
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {sections.map((section) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>{section.title}</CardTitle>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                      {section.description && (
                        <CardDescription>{section.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Questions: {section.questions?.length || 0}</h4>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/assessments/sections/${section.id}`)}
                          >
                            Manage Questions
                          </Button>
                        </div>
                        
                        {section.questions?.length > 0 ? (
                          <ul className="pl-6 list-disc text-muted-foreground space-y-1">
                            {section.questions.slice(0, 3).map((question: any) => (
                              <li key={question.id}>{question.text}</li>
                            ))}
                            {section.questions.length > 3 && (
                              <li className="list-none italic">
                                ...and {section.questions.length - 3} more questions
                              </li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground italic">No questions in this section yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Results</CardTitle>
                <CardDescription>
                  View candidate performance on this assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No results found for this assessment</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Candidate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Completed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {results.map((result) => (
                          <tr key={result.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium">{result.candidate?.name}</div>
                              <div className="text-sm text-muted-foreground">{result.candidate?.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {result.completed ? (
                                <div className="text-sm">{result.score}%</div>
                              ) : (
                                <div className="text-sm italic text-muted-foreground">Not completed</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {result.completed_at ? (
                                <div className="text-sm">
                                  {new Date(result.completed_at).toLocaleDateString()}
                                </div>
                              ) : (
                                <div className="text-sm italic text-muted-foreground">In progress</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/assessments/results/${result.id}`)}
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Section Dialog */}
        <Dialog open={showNewSectionDialog} onOpenChange={setShowNewSectionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
              <DialogDescription>
                Create a new section to organize questions in your assessment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="section-title" className="text-sm font-medium">
                  Section Title *
                </label>
                <Input
                  id="section-title"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="e.g., Product Knowledge"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="section-description" className="text-sm font-medium">
                  Description (Optional)
                </label>
                <Textarea
                  id="section-description"
                  value={newSection.description}
                  onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                  placeholder="Describe the purpose of this section"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewSectionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSection}>
                Create Section
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default AssessmentDetails;
