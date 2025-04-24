
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDatabaseQuery } from "@/hooks/useDatabaseQuery";
import ContentService from "@/services/contentService";
import { useToast } from "@/hooks/use-toast";
import MainLayout from '@/components/layout/MainLayout';
import { Book, Video } from "lucide-react";

const TrainingManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('categories');
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newModule, setNewModule] = useState({
    title: '', 
    description: '', 
    module: '', 
    is_quiz: false, 
    content: '', 
    video_url: ''
  });

  const { data: categories, refetch: refetchCategories } = useDatabaseQuery('training_categories');
  const { data: modules, refetch: refetchModules } = useDatabaseQuery('training_modules');

  const handleCreateCategory = async () => {
    const response = await ContentService.createTrainingCategory({
      ...newCategory,
      createdBy: null // Replace with actual user ID
    });

    if (response.success) {
      toast({ 
        title: "Category Created", 
        description: "New training category added successfully." 
      });
      refetchCategories();
      setNewCategory({ name: '', description: '' });
    } else {
      toast({ 
        title: "Error", 
        description: response.error,
        variant: "destructive" 
      });
    }
  };

  const handleCreateModule = async () => {
    const response = await ContentService.createTrainingModule({
      ...newModule,
      createdBy: null // Replace with actual user ID
    });

    if (response.success) {
      toast({ 
        title: "Module Created", 
        description: "New training module added successfully." 
      });
      refetchModules();
      setNewModule({
        title: '', 
        description: '', 
        module: '', 
        is_quiz: false, 
        content: '', 
        video_url: ''
      });
    } else {
      toast({ 
        title: "Error", 
        description: response.error,
        variant: "destructive" 
      });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Training Management</h1>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">Training Categories</TabsTrigger>
            <TabsTrigger value="modules">Training Modules</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input 
                    placeholder="Category Name" 
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className="mb-2"
                  />
                  <Textarea 
                    placeholder="Description (Optional)" 
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    className="mb-2"
                  />
                  <Button onClick={handleCreateCategory}>Create Category</Button>
                </CardContent>
              </Card>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>
                <div className="space-y-2">
                  {categories?.map((category) => (
                    <Card key={category.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-gray-500">{category.description}</p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="modules">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Module</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input 
                    placeholder="Module Title" 
                    value={newModule.title}
                    onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                    className="mb-2"
                  />
                  <Textarea 
                    placeholder="Description (Optional)" 
                    value={newModule.description}
                    onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                    className="mb-2"
                  />
                  <Input 
                    placeholder="Training Category" 
                    value={newModule.module}
                    onChange={(e) => setNewModule({...newModule, module: e.target.value})}
                    className="mb-2"
                  />
                  <Input 
                    placeholder="Video URL (Optional)" 
                    value={newModule.video_url}
                    onChange={(e) => setNewModule({...newModule, video_url: e.target.value})}
                    className="mb-2"
                  />
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={newModule.is_quiz}
                      onChange={(e) => setNewModule({...newModule, is_quiz: e.target.checked})}
                      className="mr-2"
                    />
                    <label>Is this a Quiz Module?</label>
                  </div>
                  <Button onClick={handleCreateModule}>Create Module</Button>
                </CardContent>
              </Card>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Existing Modules</h2>
                <div className="space-y-2">
                  {modules?.map((module) => (
                    <Card key={module.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium flex items-center">
                            {module.is_quiz ? <Book className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
                            {module.title}
                          </h3>
                          <p className="text-sm text-gray-500">Category: {module.module}</p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default TrainingManagement;
