
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { TrainingModule } from '@/types/training';

interface ModuleListProps {
  modules: TrainingModule[];
  onEdit: (module: TrainingModule) => void;
  onDelete: (module: TrainingModule) => void;
}

export const ModuleList = ({ modules, onEdit, onDelete }: ModuleListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules.map((module) => (
        <Card key={module.id} className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span className="truncate">{module.title}</span>
              <div className="flex space-x-2">
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
              Created: {new Date(module.created_at || '').toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
