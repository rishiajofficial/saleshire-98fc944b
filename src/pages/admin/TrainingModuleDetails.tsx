
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
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Video, BookOpen, CheckCircle, FileText, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Form schema for training module
const moduleSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  module: z.string().min(1, { message: "Module code is required." }),
  description: z.string().optional(),
  content: z.string().optional(),
  video_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

type ModuleFormValues = z.infer<typeof moduleSchema>;

const TrainingModuleDetails = () => {
  const { moduleId } = useParams();
  const { user } = useAuth();
  const [trainingModule, setTrainingModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: "",
      module: "",
      description: "",
      content: "",
      video_url: "",
    },
  });

  // Load module data
  useEffect(() => {
    const loadModule = async () => {
      setLoading(true);
      setLoadingError(null);
      
      try {
        if (!moduleId) {
          setLoadingError("Module ID is missing");
          return;
        }
        
        // Fetch training module
        const { data: moduleData, error: moduleError } = await supabase
          .from("training_modules")
          .select("*")
          .eq("id", moduleId)
          .single();
        
        if (moduleError) {
          throw moduleError;
        }
        
        if (!moduleData) {
          setLoadingError("Training module not found");
          return;
        }
        
        setTrainingModule(moduleData);
        
        // Set form values
        form.reset({
          title: moduleData.title || "",
          module: moduleData.module || "",
          description: moduleData.description || "",
          content: moduleData.content || "",
          video_url: moduleData.video_url || "",
        });
      } catch (error: any) {
        console.error("Error loading training module:", error.message);
        setLoadingError(`Failed to load training module: ${error.message}`);
        toast.error("Failed to load training module data");
      } finally {
        setLoading(false);
      }
    };
    
    loadModule();
  }, [moduleId, form]);

  const onSubmit = async (values: ModuleFormValues) => {
    if (!user) {
      toast.error("You must be logged in to update a training module");
      return;
    }
    
    setSaving(true);
    
    try {
      // Update the training module
      const updateData = {
        title: values.title,
        module: values.module,
        description: values.description,
        content: values.content,
        video_url: values.video_url || null,
      };
      
      const { error } = await supabase
        .from("training_modules")
        .update(updateData)
        .eq("id", moduleId);
      
      if (error) throw error;
      
      toast.success("Training module updated successfully");
    } catch (error: any) {
      console.error("Error updating training module:", error.message);
      toast.error(`Failed to update training module: ${error.message}`);
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
            <p className="text-lg text-muted-foreground">Loading training module...</p>
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
            <h2 className="text-xl font-semibold">Module Not Found</h2>
            <p className="text-muted-foreground">
              {loadingError}
            </p>
            <Button asChild>
              <Link to="/training-management">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Training Management
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
            <h1 className="text-3xl font-bold tracking-tight">Training Module Details</h1>
            <p className="text-muted-foreground mt-2">
              View and edit training module information
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/training-management">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Training Management
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Module Information</CardTitle>
              <CardDescription>
                Update module details and content
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
                          <Input placeholder="Module title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="module"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Module Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., MODULE_1" {...field} />
                        </FormControl>
                        <FormDescription>
                          A unique identifier for this training module
                        </FormDescription>
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
                            placeholder="Describe the module's purpose and content" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Module Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add the module's detailed content here" 
                            className="min-h-[200px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          You can use Markdown formatting for rich text
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="video_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/video.mp4" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Link to a training video for this module (optional)
                        </FormDescription>
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

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Module Preview</CardTitle>
                <CardDescription>
                  Preview how this module appears to candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-medium">{form.watch("title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {form.watch("description") || "No description provided"}
                  </p>
                  
                  {form.watch("video_url") && (
                    <div className="border rounded-md p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Video className="h-5 w-5 mr-2 text-blue-500" />
                        <span className="text-sm">Video attached</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={form.watch("video_url")} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" /> View
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Quiz</CardTitle>
                <CardDescription>
                  Create or edit the quiz for this module
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trainingModule?.quiz_id ? (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-green-500" />
                      <span>Quiz attached to this module</span>
                    </div>
                    <Button variant="outline" asChild className="w-full">
                      <Link to={`/quiz/${trainingModule.quiz_id}`}>
                        Edit Quiz
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This module doesn't have a quiz yet. Create one to test candidates' knowledge.
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/quiz/new?moduleId=${moduleId}`}>
                        Create Quiz
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Module Usage</CardTitle>
                <CardDescription>
                  Stats about this module
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No usage data available for this module.
                </p>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="ghost" size="sm" className="w-full">
                  View Statistics
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TrainingModuleDetails;
