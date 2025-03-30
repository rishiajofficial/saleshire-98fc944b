
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Save, AlertCircle, Video, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TrainingModuleDetails = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [module, setModule] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (moduleId) {
      loadModule();
    }
  }, [moduleId]);

  const loadModule = async () => {
    try {
      const { data, error } = await supabase
        .from("training_modules")
        .select("*")
        .eq("id", moduleId)
        .single();

      if (error) throw error;
      setModule(data);
    } catch (error: any) {
      console.error("Error loading module:", error.message);
      toast.error("Failed to load module details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateModule = async () => {
    if (!module || !user) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase.from("training_modules").update({
        title: module.title,
        description: module.description,
        content: module.content,
        video_url: module.video_url,
        module: module.module
      }).eq("id", moduleId);

      if (error) throw error;
      toast.success("Module updated successfully");
    } catch (error: any) {
      console.error("Error updating module:", error.message);
      toast.error("Failed to update module");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-lg text-muted-foreground">Loading module details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!module) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Module Not Found</h2>
          <p className="text-muted-foreground mb-6">The module you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button asChild>
            <Link to="/training-management">Go to Training Management</Link>
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
            <h1 className="text-3xl font-bold tracking-tight">{module.title}</h1>
            <p className="text-muted-foreground mt-1">
              Training module - {module.module}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link to="/training-management">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Training Management
              </Link>
            </Button>
            <Button onClick={handleUpdateModule} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Module Information</CardTitle>
                <CardDescription>
                  Edit the basic information for this training module
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <Input 
                      id="title" 
                      value={module.title || ""} 
                      onChange={(e) => setModule({...module, title: e.target.value})}
                      placeholder="Enter module title"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="module" className="text-sm font-medium">Module Code/Name</label>
                    <Input 
                      id="module" 
                      value={module.module || ""} 
                      onChange={(e) => setModule({...module, module: e.target.value})}
                      placeholder="e.g., sales-basics-101"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">Description</label>
                    <Textarea 
                      id="description" 
                      rows={4}
                      value={module.description || ""} 
                      onChange={(e) => setModule({...module, description: e.target.value})}
                      placeholder="Enter module description"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" /> Text Content
                </CardTitle>
                <CardDescription>
                  The text-based training content for this module
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={module.content || ""} 
                  onChange={(e) => setModule({...module, content: e.target.value})}
                  placeholder="Enter training content here. Supports markdown formatting."
                  className="min-h-[400px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  * You can use Markdown for formatting (headers, bold, lists, etc.)
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="h-5 w-5 mr-2" /> Video Content
                </CardTitle>
                <CardDescription>
                  Video material for this training module
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="video_url" className="text-sm font-medium">Video URL</label>
                  <Input 
                    id="video_url" 
                    value={module.video_url || ""} 
                    onChange={(e) => setModule({...module, video_url: e.target.value})}
                    placeholder="Enter YouTube or other video URL"
                  />
                </div>

                {module.video_url && (
                  <div className="aspect-video">
                    <iframe 
                      src={module.video_url.includes('youtube.com') 
                        ? module.video_url.replace('watch?v=', 'embed/') 
                        : module.video_url}
                      className="w-full h-full rounded-md border"
                      title="Video Preview"
                      allowFullScreen
                    />
                  </div>
                )}

                {!module.video_url && (
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No video URL provided</p>
                      <p className="text-xs text-muted-foreground mt-1">Add a YouTube or other video URL above</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quiz Association</CardTitle>
                <CardDescription>
                  Link this module to an assessment quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  To add a quiz to this module, create an assessment and then link it here.
                </p>
                
                <Button variant="outline" asChild>
                  <Link to="/assessments">
                    Manage Assessments
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default TrainingModuleDetails;
