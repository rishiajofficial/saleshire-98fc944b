
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ListCheck } from "lucide-react";
import { TrainingModule } from '@/types/training';
import { Separator } from "@/components/ui/separator";

interface ModuleListProps {
  modules: TrainingModule[];
  onEdit: (module: TrainingModule) => void;
  onDelete: (module: TrainingModule) => void;
}

export const ModuleList = ({ modules, onEdit, onDelete }: ModuleListProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        {modules.map((module, index) => (
          <React.Fragment key={module.id}>
            {index > 0 && <Separator className="my-4" />}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <ListCheck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">{module.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {module.description || "No description provided"}
                    </p>
                    {module.tags && module.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {module.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(module)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(module)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </React.Fragment>
        ))}
        
        {modules.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <ListCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No modules found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
