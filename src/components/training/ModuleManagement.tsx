
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Video } from "@/types/training";
import ModuleCategoryDialog from "./ModuleCategoryDialog";

interface Category {
  id: string;
  name: string;
  description: string | null;
  quiz_ids: string[] | null;
  created_at: string;
  created_by: string;
}

export default function ModuleManagement() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("module_categories")
        .select("*")
        .order("name");
        
      if (categoriesError) throw categoriesError;
      
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
      
      setCategories(categoriesData || []);
      setVideos(videosData || []);
      setAssessments(assessmentsData || []);
      
    } catch (error: any) {
      toast.error(`Failed to fetch data: ${error.message}`);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setSelectedAssessments(category.quiz_ids || []);
    
    // Fetch associated videos
    fetchCategoryVideos(category.id);
    
    setShowEditDialog(true);
  };
  
  const fetchCategoryVideos = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from("category_videos")
        .select("video_id")
        .eq("category_id", categoryId);
        
      if (error) throw error;
      
      setSelectedVideos(data?.map(item => item.video_id) || []);
      
    } catch (error: any) {
      toast.error(`Failed to fetch category videos: ${error.message}`);
    }
  };
  
  const handleUpdateCategory = async () => {
    try {
      if (!editingCategory) return;
      
      // Update category details
      const { error: updateError } = await supabase
        .from("module_categories")
        .update({
          name: categoryName,
          description: categoryDescription || null,
          quiz_ids: selectedAssessments
        })
        .eq("id", editingCategory.id);
        
      if (updateError) throw updateError;
      
      // Remove all existing video associations
      const { error: deleteError } = await supabase
        .from("category_videos")
        .delete()
        .eq("category_id", editingCategory.id);
        
      if (deleteError) throw deleteError;
      
      // Add new video associations
      if (selectedVideos.length > 0) {
        const videoAssociations = selectedVideos.map(videoId => ({
          category_id: editingCategory.id,
          video_id: videoId
        }));
        
        const { error: insertError } = await supabase
          .from("category_videos")
          .insert(videoAssociations);
          
        if (insertError) throw insertError;
      }
      
      toast.success("Category updated successfully");
      setShowEditDialog(false);
      fetchData();
      
    } catch (error: any) {
      toast.error(`Failed to update category: ${error.message}`);
    }
  };
  
  const handleDeletePrompt = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteCategory = async () => {
    try {
      if (!categoryToDelete) return;
      
      // First delete associations
      const { error: deleteVideosError } = await supabase
        .from("category_videos")
        .delete()
        .eq("category_id", categoryToDelete);
        
      if (deleteVideosError) throw deleteVideosError;
      
      // Then delete the category
      const { error: deleteCategoryError } = await supabase
        .from("module_categories")
        .delete()
        .eq("id", categoryToDelete);
        
      if (deleteCategoryError) throw deleteCategoryError;
      
      toast.success("Category deleted successfully");
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
      fetchData();
      
    } catch (error: any) {
      toast.error(`Failed to delete category: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Training Module Management</h1>
        <ModuleCategoryDialog onCategoryCreated={fetchData} />
      </div>
      
      <Tabs defaultValue="categories">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">Module Categories</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className="truncate">{category.name}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePrompt(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description || "No description provided"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {categories.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No training categories found</p>
              <p className="text-sm mt-2">Create your first training category to get started</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="videos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <CardTitle>{video.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {video.description || "No description"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Duration: {video.duration || "Unknown"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {videos.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No videos found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Module Category</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Select Videos</Label>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {videos.map(video => (
                  <div key={video.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id={`video-${video.id}`}
                      checked={selectedVideos.includes(video.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVideos([...selectedVideos, video.id]);
                        } else {
                          setSelectedVideos(selectedVideos.filter(id => id !== video.id));
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`video-${video.id}`} className="text-sm">
                      {video.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Select Assessments</Label>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {assessments.map(assessment => (
                  <div key={assessment.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id={`assessment-${assessment.id}`}
                      checked={selectedAssessments.includes(assessment.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssessments([...selectedAssessments, assessment.id]);
                        } else {
                          setSelectedAssessments(selectedAssessments.filter(id => id !== assessment.id));
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`assessment-${assessment.id}`} className="text-sm">
                      {assessment.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>
              Update Category
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
          <p>Are you sure you want to delete this training category? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
