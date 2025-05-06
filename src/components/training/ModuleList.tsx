
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ArchiveIcon, Clock, Video, FileQuestion, MoreVertical } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from '@/integrations/supabase/client';

interface Module {
  id: string;
  title: string;
  description: string | null;
  tags?: string[] | null;
  status?: 'active' | 'inactive';
  thumbnail?: string | null;
  archived?: boolean;
  created_at?: string;
  created_by?: string;
}

interface ModuleListProps {
  modules: Module[];
  onEdit: (module: Module) => void;
  onDelete: (module: Module) => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({ modules, onEdit, onDelete }) => {
  const [filter, setFilter] = useState<"active" | "archived">("active");
  
  const filteredModules = modules.filter(module => module.archived === (filter === "archived"));

  const handleArchiveModule = async (module: Module) => {
    try {
      const { error } = await supabase
        .from("training_modules")
        .update({ archived: !module.archived })
        .eq("id", module.id);
        
      if (error) throw error;
      
      toast.success(`Module ${module.archived ? "unarchived" : "archived"} successfully`);
      // Reload the page to refresh the module list
      window.location.reload();
    } catch (error: any) {
      toast.error(`Failed to update module: ${error.message}`);
    }
  };
  
  return (
    <div>
      <ToggleGroup type="single" value={filter} onValueChange={(value: "active" | "archived") => setFilter(value)} className="mb-4">
        <ToggleGroupItem value="active">Active Modules</ToggleGroupItem>
        <ToggleGroupItem value="archived">Archived Modules</ToggleGroupItem>
      </ToggleGroup>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredModules.map((module) => (
          <Card key={module.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle>{module.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(module)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleArchiveModule(module)}>
                      <ArchiveIcon className="mr-2 h-4 w-4" /> {module.archived ? "Unarchive" : "Archive"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(module)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="line-clamp-2">{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500 flex flex-col gap-1">
                <div className="flex justify-between">
                  <div>
                    <Badge variant="outline" className="bg-primary/5 text-xs">
                      {module.status || "active"}
                    </Badge>
                  </div>
                  <span className="text-xs">
                    Created: {module.created_at ? new Date(module.created_at).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredModules.length === 0 && (
        <div className="text-center py-8 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No {filter} modules found</p>
        </div>
      )}
    </div>
  );
};
