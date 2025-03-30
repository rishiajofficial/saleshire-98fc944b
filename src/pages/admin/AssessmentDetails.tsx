
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Loader2, Plus, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Form schema for assessment
const assessmentSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  difficulty: z.string().optional(),
  prevent_backtracking: z.boolean().default(false),
  randomize_questions: z.boolean().default(false),
  time_limit: z.union([
    z.string().refine(val => !val || !isNaN(Number(val)), {
      message: "Time limit must be a number in minutes."
    }).transform(val => val ? Number(val) : null),
    z.number().nullable()
  ]).nullable().optional(),
});

type AssessmentFormValues = z.infer<typeof assessmentSchema>;

const AssessmentDetails = () => {
  const { assessmentId } = useParams();
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "",
      prevent_backtracking: false,
      randomize_questions: false,
      time_limit: null,
    },
  });

  // Load assessment data
  useEffect(() => {
    const loadAssessment = async () => {
      setLoading(true);
      setLoadingError(null);
      
      try {
        if (!assessmentId) {
          setLoadingError("Assessment ID is missing");
          return;
        }
        
        // Fetch assessment
        const { data: assessmentData, error: assessmentError } = await supabase
          .from("assessments")
          .select("*")
          .eq("id", assessmentId)
          .single();
        
        if (assessmentError) {
          throw assessmentError;
        }
        
        if (!assessmentData) {
          setLoadingError("Assessment not found");
          return;
        }
        
        setAssessment(assessmentData);
        
        // Set form values
        form.reset({
          title: assessmentData.title || "",
          description: assessmentData.description || "",
          difficulty: assessmentData.difficulty || "",
          prevent_backtracking: assessmentData.prevent_backtracking || false,
          randomize_questions: assessmentData.randomize_questions || false,
          time_limit: assessmentData.time_limit !== null ? assessmentData.time_limit : null,
        });
        
        // Fetch sections
        const { data: sectionData, error: sectionError } = await supabase
          .from("assessment_sections")
          .select("*")
          .eq("assessment_id", assessmentId)
          .order("created_at", { ascending: true });
        
        if (sectionError) {
          throw sectionError;
        }
        
        setSections(sectionData || []);
      } catch (error: any) {
        console.error("Error loading assessment:", error.message);
        setLoadingError(`Failed to load assessment: ${error.message}`);
        toast.error("Failed to load assessment data");
      } finally {
        setLoading(false);
      }
    };
    
    loadAssessment();
  }, [assessmentId, form]);

  const onSubmit = async (values: AssessmentFormValues) => {
    if (!user) {
      toast.error("You must be logged in to update an assessment");
      return;
    }
    
    setSaving(true);
    
    try {
      // Update the assessment
      const updateData = {
        title: values.title,
        description: values.description,
        difficulty: values.difficulty,
        prevent_backtracking: values.prevent_backtracking,
        randomize_questions: values.randomize_questions,
        time_limit: values.time_limit,
      };
      
      const { error } = await supabase
        .from("assessments")
        .update(updateData)
        .eq("id", assessmentId);
      
      if (error) throw error;
      
      toast.success("Assessment updated successfully");
    } catch (error: any) {
      console.error("Error updating assessment:", error.message);
      toast.error(`Failed to update assessment: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading assessment details...</p>
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
                <BookOpen className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold">Assessment Not Found</h2>
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
            <h1 className="text-3xl font-bold tracking-tight">Assessment Details</h1>
            <p className="text-muted-foreground mt-2">
              View and edit assessment information
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/assessments">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Assessments
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Information</CardTitle>
            <CardDescription>
              Update assessment details and settings
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
                        <Input placeholder="Assessment title" {...field} />
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
                          placeholder="Describe the assessment purpose and content" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Easy, Medium, Hard" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="time_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Leave empty for no time limit" 
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? null : Number(value) || null);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="prevent_backtracking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Prevent Backtracking
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Users cannot return to previous questions
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="randomize_questions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Randomize Questions
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Questions will appear in random order
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
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
              <CardTitle>Assessment Sections</CardTitle>
              <CardDescription>
                Manage the sections of this assessment
              </CardDescription>
            </div>
            <Button asChild size="sm">
              <Link to={`/assessments/sections/new?assessmentId=${assessmentId}`}>
                <Plus className="h-4 w-4 mr-1" /> Add Section
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {sections.length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <div className="flex justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No sections yet</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  This assessment doesn't have any sections. Add sections to organize questions.
                </p>
                <Button asChild className="mt-4" variant="outline">
                  <Link to={`/assessments/sections/new?assessmentId=${assessmentId}`}>
                    <Plus className="h-4 w-4 mr-1" /> Add Your First Section
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section) => (
                  <Card key={section.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/assessments/sections/${section.id}`}>
                            Edit Section
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {section.description ? (
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No description provided</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Assessment Results</CardTitle>
              <CardDescription>
                View the results of this assessment
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to={`/assessments/results?assessmentId=${assessmentId}`}>
                View All Results
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                View assessment results to see how candidates are performing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AssessmentDetails;
