import React, { useState } from "react";
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModuleManagement from "@/components/training/ModuleManagement";

const TrainingManagement = () => {
  const [activeTab, setActiveTab] = useState("modules");
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Training Management</h1>
        
        <Tabs defaultValue="modules" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="modules">Training Modules</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules">
            <ModuleManagement />
          </TabsContent>
          
          <TabsContent value="videos">
            <h2 className="text-2xl font-bold mb-4">Video Management</h2>
            <p>You can upload and manage training videos here.</p>
            {/* Video upload and management component would go here */}
          </TabsContent>
          
          <TabsContent value="assessments">
            <h2 className="text-2xl font-bold mb-4">Assessment Management</h2>
            <p>Create and manage assessments for training modules.</p>
            {/* Assessment management component would go here */}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default TrainingManagement;
