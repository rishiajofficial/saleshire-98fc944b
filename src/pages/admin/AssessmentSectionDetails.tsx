
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, CheckCircle, AlertTriangle, Edit, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Form schema for assessment section
const sectionSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

const AssessmentSectionDetails = () => {
  const { sectionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize form
  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Load section data
  useEffect(() => {
    const loadSection = async () => {
      setLoading(true);
      setLoadingError(null);
      
      try {
        if (!sectionId) {
          setLoadingError("Section ID is missing");
          return;
        }
        
        // Fetch section
        const { data: sectionData, error: sectionError } = await supabase
          .from("assessment_sections")
          .select("*, assessments:assessment_id(*)")
          .eq("id", sectionId)
          .single();
        
        if (sectionError) {
          throw sectionError;
        }
        
        if (!sectionData) {
          setLoadingError("Section not found");
          return;
        }
        
        setSection(sectionData);
        setAssessmentId(sectionData.assessment_id);
        
        // Set form values
        form.reset({
          title: sectionData.title || "",
          description: sectionData.description || "",
        });
        
        // Fetch questions
        const { data: questionData, error: questionError } = await supabase
          .from("questions")
          .select("*")
          .eq("section_id", sectionId)
          .order("created_at", { ascending: true });
        
        if (questionError) {
          throw questionError;
        }
        
        setQuestions(questionData || []);
      } catch (error: any) {
        console.error("Error loading section:", error.message);
        setLoadingError(`Failed to load section: ${error.message}`);
        toast.error("Failed to load section data");
      } finally {
        setLoading(false);
      }
    };
    
    loadSection();
  }, [sectionId, form]);

  const onSubmit = async (values: SectionFormValues) => {
    if (!user) {
      toast.error("You must be logged in to update an assessment section");
      return;
    }
    
    setSaving(true);
    
    try {
      // Update the section
      const updateData = {
        title: values.title,
        description: values.description,
      };
      
      const { error } = await supabase
        .from("assessment_sections")
        .update(updateData)
        .eq("id", sectionId);
      
      if (error) throw error;
      
      toast.success("Section updated successfully");
    } catch (error: any) {
      console.error("Error updating section:", error.message);
      toast.error(`Failed to update section: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!user) {
      toast.error("You must be logged in to delete a section");
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // First delete all questions in this section
      const { error: questionDeleteError } = await supabase
        .from("questions")
        .delete()
        .eq("section_id", sectionId);
      
      if (questionDeleteError) throw questionDeleteError;
      
      // Then delete the section
      const { error: sectionDeleteError } = await supabase
        .from("assessment_sections")
        .delete()
        .eq("id", sectionId);
      
      if (sectionDeleteError) throw sectionDeleteError;
      
      toast.success("Section deleted successfully");
      
      // Redirect to assessment details
      navigate(`/assessments/${assessmentId}`);
    } catch (error: any) {
      console.error("Error deleting section:", error.message);
      toast.error(`Failed to delete section: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading section details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loadingError) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center space-y-4 max-w-md text-center">
            <div className="p-3 rounded-full bg-red-50">
              <div className="rounded-full bg-red-100 p-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold">Section Not Found</h2>
            <p className="text-muted-foreground">
              {loadingError}
            </p>
            <Button asChild>
              <Link to="/assessments">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assessments
              </Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Section Details</h1>
            <p className="text-muted-foreground mt-2">
              View and edit assessment section information
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline">
              <Link to={`/assessments/${assessmentId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Assessment
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Section Information</CardTitle>
            <CardDescription>
              Update section details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Section title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the section purpose and content" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> 
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Questions</CardTitle>
              <CardDescription>
                Manage the questions in this section
              </CardDescription>
            </div>
            <Button asChild size="sm">
              <Link to={`/questions/new?sectionId=${sectionId}`}>
                <Plus className="h-4 w-4 mr-1" /> Add Question
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <div className="flex justify-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No questions yet</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  This section doesn't have any questions. Add questions to complete the assessment.
                </p>
                <Button asChild className="mt-4" variant="outline">
                  <Link to={`/questions/new?sectionId=${sectionId}`}>
                    <Plus className="h-4 w-4 mr-1" /> Add Your First Question
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <p className="font-medium">Question {index + 1}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{question.text}</p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/questions/${question.id}`}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Section</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this section? This action cannot be undone and will also delete all questions within this section.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-destructive/10 rounded-md border border-destructive/20 text-destructive">
              <p className="text-sm">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Warning: All questions in this section will be permanently deleted.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteSection} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash className="h-4 w-4 mr-1" /> Delete Section
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default AssessmentSectionDetails;
