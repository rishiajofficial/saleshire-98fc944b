
import React, { useState } from "react";
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModuleManagement from "@/components/training/ModuleManagement";
import VideoManagement from "@/components/training/VideoManagement";
import AssessmentManagement from "@/components/training/AssessmentManagement";
import { Book, Video, FileText } from "lucide-react";

const TrainingManagement = () => {
  const [activeTab, setActiveTab] = useState("modules");
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Training Management</h1>
        
        <Tabs defaultValue="modules" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Training Modules
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Assessments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules">
            <ModuleManagement />
          </TabsContent>
          
          <TabsContent value="videos">
            <VideoManagement />
          </TabsContent>
          
          <TabsContent value="assessments">
            <AssessmentManagement />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default TrainingManagement;
