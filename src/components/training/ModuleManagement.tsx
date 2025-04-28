
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
import { TrainingModule, ModuleVideo, ModuleAssessment } from "@/types/training";
import { Badge } from "@/components/ui/badge";
import { ModuleList } from "./ModuleList";

interface Module {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  status: 'active' | 'inactive';
  thumbnail: string | null;
  created_at?: string;
  created_by?: string;
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
    title: "",
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
      
      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("training_modules")
        .select("id, title, description, created_at, created_by")
        .order("title");
        
      if (modulesError) {
        console.error("Error fetching modules:", modulesError);
        toast.error(`Failed to fetch modules: ${modulesError.message}`);
        setModules([]);
      } else {
        // Format modules safely
        const formattedModules: Module[] = (modulesData || []).map(module => ({
          id: module.id || '',
          title: module.title || '',
          description: module.description || null,
          tags: [], // Default to empty array since tags column doesn't exist yet
          status: 'active', // Default to active since status column doesn't exist yet
          thumbnail: null,
          created_at: module.created_at || '',
          created_by: module.created_by || ''
        }));
        
        setModules(formattedModules);
      }
      
      // Fetch videos
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("*")
        .order("title");
        
      if (videosError) {
        console.error("Error fetching videos:", videosError);
        toast.error(`Failed to fetch videos: ${videosError.message}`);
        setVideos([]);
      } else {
        setVideos(videosData || []);
      }
      
      // Fetch assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("assessments")
        .select("*")
        .order("title");
        
      if (assessmentsError) {
        console.error("Error fetching assessments:", assessmentsError);
        toast.error(`Failed to fetch assessments: ${assessmentsError.message}`);
        setAssessments([]);
      } else {
        setAssessments(assessmentsData || []);
      }
      
    } catch (error: any) {
      toast.error(`Failed to fetch data: ${error.message}`);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleRelations = async (moduleId: string) => {
    try {
      // Use direct query approach instead of RPC since the types aren't defined
      const { data: videoRelations, error: videoError } = await supabase
        .from("module_videos")
        .select("*")
        .eq("module_id", moduleId)
        .order("order_number");
        
      if (videoError) {
        console.error("Error fetching module videos:", videoError);
        toast.error(`Failed to fetch module videos: ${videoError.message}`);
        setModuleVideos([]);
        setSelectedVideos([]);
      } else {
        // Safely format video relations
        const formattedVideoRelations: ModuleVideo[] = (videoRelations || []).map(relation => ({
          id: relation.id || '',
          module_id: relation.module_id || '',
          video_id: relation.video_id || '',
          order_number: relation.order_number || 0,
          created_at: relation.created_at
        }));
        
        setModuleVideos(formattedVideoRelations);
        setSelectedVideos(formattedVideoRelations.map(mv => mv.video_id));
      }
      
      const { data: assessmentRelations, error: assessmentError } = await supabase
        .from("module_assessments")
        .select("*")
        .eq("module_id", moduleId)
        .order("order_number");
        
      if (assessmentError) {
        console.error("Error fetching module assessments:", assessmentError);
        toast.error(`Failed to fetch module assessments: ${assessmentError.message}`);
        setModuleAssessments([]);
        setSelectedAssessments([]);
      } else {
        // Safely format assessment relations
        const formattedAssessmentRelations: ModuleAssessment[] = (assessmentRelations || []).map(relation => ({
          id: relation.id || '',
          module_id: relation.module_id || '',
          assessment_id: relation.assessment_id || '',
          order_number: relation.order_number || 0,
          created_at: relation.created_at
        }));
        
        setModuleAssessments(formattedAssessmentRelations);
        setSelectedAssessments(formattedAssessmentRelations.map(ma => ma.assessment_id));
      }
    } catch (error: any) {
      toast.error(`Failed to fetch module relations: ${error.message}`);
      console.error("Error fetching module relations:", error);
      
      // Set empty arrays as fallback
      setModuleVideos([]);
      setModuleAssessments([]);
      setSelectedVideos([]);
      setSelectedAssessments([]);
    }
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      title: "",
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
      title: module.title,
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
      if (!formData.title) {
        toast.error("Module name is required");
        return;
      }

      if (!user?.id) {
        toast.error("You must be logged in to create a module");
        return;
      }

      // Create the module
      const { data: moduleData, error: moduleError } = await supabase
        .from("training_modules")
        .insert({
          title: formData.title,
          description: formData.description || null,
          module: formData.title.replace(/\s+/g, '_').toLowerCase(), // Create a module code based on the title
          created_by: user.id
        })
        .select();

      if (moduleError) throw moduleError;
      
      const moduleId = moduleData[0].id;
      
      // Create module-video relations directly
      if (selectedVideos.length > 0) {
        const videoRelations = selectedVideos.map((videoId, index) => ({
          module_id: moduleId,
          video_id: videoId,
          order_number: index
        }));
          
        const { error: videoInsertError } = await supabase
          .from("module_videos")
          .insert(videoRelations);
            
        if (videoInsertError) {
          console.error("Error creating module videos:", videoInsertError);
          toast.error(`Failed to link videos: ${videoInsertError.message}`);
        }
      }
      
      // Create module-assessment relations directly
      if (selectedAssessments.length > 0) {
        const assessmentRelations = selectedAssessments.map((assessmentId, index) => ({
          module_id: moduleId,
          assessment_id: assessmentId,
          order_number: index
        }));
        
        const { error: assessmentInsertError } = await supabase
          .from("module_assessments")
          .insert(assessmentRelations);
            
        if (assessmentInsertError) {
          console.error("Error creating module assessments:", assessmentInsertError);
          toast.error(`Failed to link assessments: ${assessmentInsertError.message}`);
        }
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
      if (!formData.title) {
        toast.error("Module name is required");
        return;
      }

      // Update the module
      const { error: moduleError } = await supabase
        .from("training_modules")
        .update({
          title: formData.title,
          description: formData.description || null
        })
        .eq("id", selectedModule.id);

      if (moduleError) throw moduleError;
      
      // Update module-video relations
      // First delete existing relations
      const { error: deleteVideosError } = await supabase
        .from("module_videos")
        .delete()
        .eq("module_id", selectedModule.id);
      
      if (deleteVideosError) {
        console.error("Error deleting module videos:", deleteVideosError);
        toast.error(`Failed to update video relations: ${deleteVideosError.message}`);
      }
      
      // Then create new video relations
      if (selectedVideos.length > 0) {
        const videoRelations = selectedVideos.map((videoId, index) => ({
          module_id: selectedModule.id,
          video_id: videoId,
          order_number: index
        }));
        
        const { error: createVideosError } = await supabase
          .from("module_videos")
          .insert(videoRelations);
            
        if (createVideosError) {
          console.error("Error creating module videos:", createVideosError);
          toast.error(`Failed to link videos: ${createVideosError.message}`);
        }
      }
      
      // Update module-assessment relations
      // First delete existing relations
      const { error: deleteAssessmentsError } = await supabase
        .from("module_assessments")
        .delete()
        .eq("module_id", selectedModule.id);
        
      if (deleteAssessmentsError) {
        console.error("Error deleting module assessments:", deleteAssessmentsError);
        toast.error(`Failed to update assessment relations: ${deleteAssessmentsError.message}`);
      }
      
      // Then create new assessment relations
      if (selectedAssessments.length > 0) {
        const assessmentRelations = selectedAssessments.map((assessmentId, index) => ({
          module_id: selectedModule.id,
          assessment_id: assessmentId,
          order_number: index
        }));
        
        const { error: createAssessmentsError } = await supabase
          .from("module_assessments")
          .insert(assessmentRelations);
            
        if (createAssessmentsError) {
          console.error("Error creating module assessments:", createAssessmentsError);
          toast.error(`Failed to link assessments: ${createAssessmentsError.message}`);
        }
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
      // Fix: Use job_training table instead of job_modules
      const { count, error: jobCheckError } = await supabase
        .from("job_training")
        .select('*', { count: 'exact', head: true })
        .eq("training_module_id", selectedModule.id);
        
      if (jobCheckError) throw jobCheckError;
      
      if (count && count > 0) {
        toast.error("Cannot delete module as it is used in one or more job postings");
        setShowDeleteDialog(false);
        return;
      }
      
      // Delete module relations first
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
      
      <ModuleList 
        modules={modules} 
        onEdit={handleOpenEditDialog} 
        onDelete={handleOpenDeleteDialog}
      />
      
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
                name="title" 
                value={formData.title}
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
                name="title"
                value={formData.title}
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
      
      {/* Delete Module Confirmation Dialog */}
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
