import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Check, ArrowUp, ArrowDown } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ModuleVideo, ModuleAssessment } from "@/types/training";
import { Badge } from "@/components/ui/badge";

interface Module {
  id: string;
  title: string;
  name: string;
  description: string | null;
  tags: string[] | null;
  status: 'active' | 'inactive';
  thumbnail: string | null;
  created_at: string;
  created_by: string;
}

const ModuleManagement = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [moduleVideos, setModuleVideos] = useState<ModuleVideo[]>([]);
  const [moduleAssessments, setModuleAssessments] = useState<ModuleAssessment[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: "",
    status: "active" as 'active' | 'inactive',
    thumbnail: ""
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch modules with the correct fields
      const { data: modulesData, error: modulesError } = await supabase
        .from("training_modules")
        .select(`
          id,
          title,
          description,
          tags,
          status,
          thumbnail,
          created_at,
          created_by
        `)
        .order("title");
        
      if (modulesError) throw modulesError;
      
      // Format modules to match our Module interface
      const formattedModules = (modulesData || []).map(module => ({
        ...module,
        name: module.title, // Use title as name
        tags: module.tags || [],
        status: module.status || 'active',
        thumbnail: module.thumbnail || null
      }));
      
      // Fetch videos
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("*")
        .order("title");
        
      if (videosError) throw videosError;
      
      // Fetch assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("assessments")
        .select("*")
        .order("title");
        
      if (assessmentsError) throw assessmentsError;
      
      setModules(formattedModules);
      setVideos(videosData || []);
      setAssessments(assessmentsData || []);
      
    } catch (error: any) {
      toast.error(`Failed to fetch data: ${error.message}`);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleRelations = async (moduleId: string) => {
    try {
      // Use RPC or direct SQL query instead of trying to join
      const { data: moduleVideosData, error: moduleVideosError } = await supabase
        .from("module_videos")
        .select("id, module_id, video_id, order")
        .eq("module_id", moduleId)
        .order("order");
        
      if (moduleVideosError) throw moduleVideosError;
      
      const { data: moduleAssessmentsData, error: moduleAssessmentsError } = await supabase
        .from("module_assessments")
        .select("id, module_id, assessment_id, order")
        .eq("module_id", moduleId)
        .order("order");
        
      if (moduleAssessmentsError) throw moduleAssessmentsError;
      
      setModuleVideos(moduleVideosData || []);
      setModuleAssessments(moduleAssessmentsData || []);
      
      // Set selected IDs for the form
      setSelectedVideos((moduleVideosData || []).map(mv => mv.video_id));
      setSelectedAssessments((moduleAssessmentsData || []).map(ma => ma.assessment_id));
    } catch (error: any) {
      toast.error(`Failed to fetch module relations: ${error.message}`);
      console.error("Error fetching module relations:", error);
    }
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      name: "",
      description: "",
      tags: "",
      status: "active",
      thumbnail: ""
    });
    setSelectedVideos([]);
    setSelectedAssessments([]);
    setShowCreateDialog(true);
  };

  const handleOpenEditDialog = async (module: Module) => {
    setSelectedModule(module);
    setFormData({
      name: module.name,
      description: module.description || "",
      tags: module.tags ? module.tags.join(", ") : "",
      status: module.status || "active",
      thumbnail: module.thumbnail || ""
    });
    
    await fetchModuleRelations(module.id);
    setShowEditDialog(true);
  };

  const handleOpenDeleteDialog = (module: Module) => {
    setSelectedModule(module);
    setShowDeleteDialog(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData({ ...formData, status: checked ? "active" : "inactive" });
  };

  const handleVideoToggle = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleAssessmentToggle = (assessmentId: string) => {
    setSelectedAssessments(prev => 
      prev.includes(assessmentId) 
        ? prev.filter(id => id !== assessmentId)
        : [...prev, assessmentId]
    );
  };

  const moveVideo = (videoId: string, direction: 'up' | 'down') => {
    setSelectedVideos(prev => {
      const newOrder = [...prev];
      const index = newOrder.indexOf(videoId);
      if (direction === 'up' && index > 0) {
        // Swap with previous item
        [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      } else if (direction === 'down' && index < newOrder.length - 1) {
        // Swap with next item
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      }
      return newOrder;
    });
  };

  const moveAssessment = (assessmentId: string, direction: 'up' | 'down') => {
    setSelectedAssessments(prev => {
      const newOrder = [...prev];
      const index = newOrder.indexOf(assessmentId);
      if (direction === 'up' && index > 0) {
        // Swap with previous item
        [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      } else if (direction === 'down' && index < newOrder.length - 1) {
        // Swap with next item
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      }
      return newOrder;
    });
  };

  const handleCreateModule = async () => {
    try {
      if (!formData.name) {
        toast.error("Module name is required");
        return;
      }

      if (!user?.id) {
        toast.error("You must be logged in to create a module");
        return;
      }

      // Create the module with both name and title fields
      const { data: moduleData, error: moduleError } = await supabase
        .from("training_modules")
        .insert({
          title: formData.name, // Set title from name
          description: formData.description || null,
          tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()) : null,
          status: formData.status,
          thumbnail: formData.thumbnail || null,
          created_by: user.id
        })
        .select();

      if (moduleError) throw moduleError;
      
      const moduleId = moduleData[0].id;
      
      // Create module-video relations
      if (selectedVideos.length > 0) {
        const videoRelations = selectedVideos.map((videoId, index) => ({
          module_id: moduleId,
          video_id: videoId,
          order: index
        }));
        
        const { error: videoRelationError } = await supabase
          .from("module_videos")
          .insert(videoRelations);
          
        if (videoRelationError) throw videoRelationError;
      }
      
      // Create module-assessment relations
      if (selectedAssessments.length > 0) {
        const assessmentRelations = selectedAssessments.map((assessmentId, index) => ({
          module_id: moduleId,
          assessment_id: assessmentId,
          order: index
        }));
        
        const { error: assessmentRelationError } = await supabase
          .from("module_assessments")
          .insert(assessmentRelations);
          
        if (assessmentRelationError) throw assessmentRelationError;
      }
      
      toast.success("Training module created successfully");
      setShowCreateDialog(false);
      fetchData();
    } catch (error: any) {
      toast.error(`Failed to create module: ${error.message}`);
    }
  };

  const handleUpdateModule = async () => {
    try {
      if (!selectedModule) return;
      if (!formData.name) {
        toast.error("Module name is required");
        return;
      }

      // Update the title field (and NOT name since it doesn't exist in the schema)
      const { error: moduleError } = await supabase
        .from("training_modules")
        .update({
          title: formData.name, // Update title, not name
          description: formData.description || null,
          tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()) : null,
          status: formData.status,
          thumbnail: formData.thumbnail || null
        })
        .eq("id", selectedModule.id);

      if (moduleError) throw moduleError;
      
      // Update module-video relations
      // First delete existing relations
      await supabase
        .from("module_videos")
        .delete()
        .eq("module_id", selectedModule.id);
      
      // Then create new relations
      if (selectedVideos.length > 0) {
        const videoRelations = selectedVideos.map((videoId, index) => ({
          module_id: selectedModule.id,
          video_id: videoId,
          order: index
        }));
        
        const { error: videoRelationError } = await supabase
          .from("module_videos")
          .insert(videoRelations);
          
        if (videoRelationError) throw videoRelationError;
      }
      
      // Update module-assessment relations
      // First delete existing relations
      await supabase
        .from("module_assessments")
        .delete()
        .eq("module_id", selectedModule.id);
      
      // Then create new relations
      if (selectedAssessments.length > 0) {
        const assessmentRelations = selectedAssessments.map((assessmentId, index) => ({
          module_id: selectedModule.id,
          assessment_id: assessmentId,
          order: index
        }));
        
        const { error: assessmentRelationError } = await supabase
          .from("module_assessments")
          .insert(assessmentRelations);
          
        if (assessmentRelationError) throw assessmentRelationError;
      }
      
      toast.success("Training module updated successfully");
      setShowEditDialog(false);
      fetchData();
    } catch (error: any) {
      toast.error(`Failed to update module: ${error.message}`);
    }
  };

  const handleDeleteModule = async () => {
    try {
      if (!selectedModule) return;
      
      // Check if the module is used in any jobs
      const { data: jobModules, error: jobCheckError } = await supabase
        .from("job_modules")
        .select("job_id")
        .eq("module_id", selectedModule.id);
        
      if (jobCheckError) throw jobCheckError;
      
      if (jobModules && jobModules.length > 0) {
        toast.error("Cannot delete module as it is used in one or more job postings");
        setShowDeleteDialog(false);
        return;
      }
      
      // Delete module relations first (cascading should handle this, but we'll do it explicitly)
      await Promise.all([
        supabase.from("module_videos").delete().eq("module_id", selectedModule.id),
        supabase.from("module_assessments").delete().eq("module_id", selectedModule.id)
      ]);
      
      // Delete the module
      const { error: deleteError } = await supabase
        .from("training_modules")
        .delete()
        .eq("id", selectedModule.id);
        
      if (deleteError) throw deleteError;
      
      toast.success("Training module deleted successfully");
      setShowDeleteDialog(false);
      fetchData();
    } catch (error: any) {
      toast.error(`Failed to delete module: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Training Module Management</h2>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Create Module
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="overflow-hidden">
            <CardHeader className="relative">
              {module.status === "inactive" && (
                <Badge variant="outline" className="absolute top-2 right-2">
                  Inactive
                </Badge>
              )}
              <CardTitle className="flex justify-between items-center">
                <span className="truncate">{module.name}</span>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditDialog(module)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDeleteDialog(module)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {module.description || "No description provided"}
              </p>
              {module.tags && module.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {module.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Created: {new Date(module.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {modules.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No training modules found</p>
          <p className="text-sm mt-2">Create your first training module to get started</p>
        </div>
      )}
      
      {/* Create Module Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Training Module</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Module Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="sales, marketing, onboarding"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status === "active"}
                onCheckedChange={handleStatusChange}
              />
              <Label htmlFor="status">Active</Label>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Select Videos</h3>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {videos.map(video => (
                  <div key={video.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id={`video-${video.id}`}
                      checked={selectedVideos.includes(video.id)}
                      onChange={() => handleVideoToggle(video.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`video-${video.id}`} className="text-sm flex-1">
                      {video.title}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Videos will be presented in the order selected
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Selected Videos Order</h3>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {selectedVideos.length > 0 ? (
                  selectedVideos.map((videoId, index) => {
                    const video = videos.find(v => v.id === videoId);
                    return (
                      <div key={videoId} className="flex items-center justify-between py-1">
                        <span className="text-sm">{index + 1}. {video?.title}</span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={index === 0}
                            onClick={() => moveVideo(videoId, 'up')}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={index === selectedVideos.length - 1}
                            onClick={() => moveVideo(videoId, 'down')}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No videos selected</p>
                )}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Select Assessments</h3>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {assessments.map(assessment => (
                  <div key={assessment.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id={`assessment-${assessment.id}`}
                      checked={selectedAssessments.includes(assessment.id)}
                      onChange={() => handleAssessmentToggle(assessment.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`assessment-${assessment.id}`} className="text-sm flex-1">
                      {assessment.title}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Assessments will be presented in the order selected
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Selected Assessments Order</h3>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {selectedAssessments.length > 0 ? (
                  selectedAssessments.map((assessmentId, index) => {
                    const assessment = assessments.find(a => a.id === assessmentId);
                    return (
                      <div key={assessmentId} className="flex items-center justify-between py-1">
                        <span className="text-sm">{index + 1}. {assessment?.title}</span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={index === 0}
                            onClick={() => moveAssessment(assessmentId, 'up')}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={index === selectedAssessments.length - 1}
                            onClick={() => moveAssessment(assessmentId, 'down')}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No assessments selected</p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateModule}>
              Create Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Module Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Training Module</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Module Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-tags">Tags (comma separated)</Label>
              <Input
                id="edit-tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
              <Input
                id="edit-thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-status"
                checked={formData.status === "active"}
                onCheckedChange={handleStatusChange}
              />
              <Label htmlFor="edit-status">Active</Label>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Select Videos</h3>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {videos.map(video => (
                  <div key={video.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id={`edit-video-${video.id}`}
                      checked={selectedVideos.includes(video.id)}
                      onChange={() => handleVideoToggle(video.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`edit-video-${video.id}`} className="text-sm flex-1">
                      {video.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Selected Videos Order</h3>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {selectedVideos.length > 0 ? (
                  selectedVideos.map((videoId, index) => {
                    const video = videos.find(v => v.id === videoId);
                    return (
                      <div key={videoId} className="flex items-center justify-between py-1">
                        <span className="text-sm">{index + 1}. {video?.title}</span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={index === 0}
                            onClick={() => moveVideo(videoId, 'up')}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={index === selectedVideos.length - 1}
                            onClick={() => moveVideo(videoId, 'down')}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No videos selected</p>
                )}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Select Assessments</h3>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {assessments.map(assessment => (
                  <div key={assessment.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id={`edit-assessment-${assessment.id}`}
                      checked={selectedAssessments.includes(assessment.id)}
                      onChange={() => handleAssessmentToggle(assessment.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`edit-assessment-${assessment.id}`} className="text-sm flex-1">
                      {assessment.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Selected Assessments Order</h3>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {selectedAssessments.length > 0 ? (
                  selectedAssessments.map((assessmentId, index) => {
                    const assessment = assessments.find(a => a.id === assessmentId);
                    return (
                      <div key={assessmentId} className="flex items-center justify-between py-1">
                        <span className="text-sm">{index + 1}. {assessment?.title}</span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={index === 0}
                            onClick={() => moveAssessment(assessmentId, 'up')}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={index === selectedAssessments.length - 1}
                            onClick={() => moveAssessment(assessmentId, 'down')}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No assessments selected</p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateModule}>
              Update Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this training module? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteModule}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModuleManagement;
