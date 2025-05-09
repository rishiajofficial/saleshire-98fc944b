
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BookMarked, Copy, Edit, Plus, Save, TemplateIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";

// Predefined job templates
const predefinedTemplates = [
  {
    id: "sales-rep",
    title: "Sales Representative",
    description: "We are looking for a results-driven Sales Representative to be responsible for generating leads and meeting sales goals. The successful candidate will play a key role in increasing income and revenue by managing and negotiating with clients, generating leads, qualifying prospects and managing sales of products and/or services.",
    department: "Sales",
    location: "Remote",
    employment_type: "Full-Time",
    salary_range: "$50,000 - $70,000"
  },
  {
    id: "marketing-specialist",
    title: "Marketing Specialist",
    description: "We are seeking a Marketing Specialist to join our team. The ideal candidate will have experience in developing marketing strategies, creating content for various channels, analyzing market trends, and managing social media campaigns.",
    department: "Marketing",
    location: "Hybrid",
    employment_type: "Full-Time",
    salary_range: "$55,000 - $75,000"
  },
  {
    id: "customer-support",
    title: "Customer Support Representative",
    description: "We are looking for a Customer Support Representative to join our team and interact with customers to handle inquiries, process orders, provide information about products and services, and resolve any emerging problems.",
    department: "Customer Service",
    location: "Remote",
    employment_type: "Full-Time",
    salary_range: "$40,000 - $55,000"
  }
];

interface JobTemplatesProps {
  onSelectTemplate: (template: Partial<Job>) => void;
  userTemplates?: Partial<Job>[];
}

export const JobTemplates: React.FC<JobTemplatesProps> = ({ 
  onSelectTemplate,
  userTemplates = [] 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [currentJob, setCurrentJob] = useState<Partial<Job> | null>(null);
  
  const handleSelectTemplate = (template: Partial<Job>) => {
    onSelectTemplate(template);
    setIsOpen(false);
    toast.success(`Template "${template.title}" selected`);
  };
  
  const handleSaveAsTemplate = async (job: Partial<Job>) => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    
    try {
      setCurrentJob(null);
      setSaveDialogOpen(false);
      
      // In a real implementation, this would save the template to the database
      // For now we'll just show a success message
      toast.success(`Job template "${templateName}" saved`);
    } catch (error) {
      toast.error("Failed to save template");
      console.error(error);
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <BookMarked className="h-3.5 w-3.5" />
            Job Templates
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Templates</DialogTitle>
            <DialogDescription>
              Choose a template to start with or create your own
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Standard Templates</h3>
              <Separator className="my-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {predefinedTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{template.title}</CardTitle>
                      <CardDescription className="text-xs">{template.department} · {template.employment_type}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-xs">
                      <p className="line-clamp-3">{template.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            
            {userTemplates.length > 0 && (
              <div>
                <h3 className="text-lg font-medium">Your Templates</h3>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {userTemplates.map((template, idx) => (
                    <Card key={idx} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{template.title}</CardTitle>
                        <CardDescription className="text-xs">{template.department} · {template.employment_type}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-xs">
                        <p className="line-clamp-3">{template.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          Use Template
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Give your template a name to save it for future use
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input 
                id="template-name" 
                placeholder="e.g., Senior Developer Position"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => currentJob && handleSaveAsTemplate(currentJob)}
              disabled={!templateName.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
