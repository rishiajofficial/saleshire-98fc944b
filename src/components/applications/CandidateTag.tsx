
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CandidateTagProps {
  candidateId: string;
  tags: string[];
  onAddTag: (candidateId: string, tag: string) => void;
  onRemoveTag: (candidateId: string, tag: string) => void;
}

export const CandidateTag = ({ 
  candidateId, 
  tags, 
  onAddTag, 
  onRemoveTag 
}: CandidateTagProps) => {
  const [newTag, setNewTag] = useState('');
  
  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(candidateId, newTag.trim());
      setNewTag('');
    }
  };
  
  const predefinedTags = ['Excellent', 'Promising', 'Needs Training', 'Not Suitable'];
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 rounded-full"
        >
          <Tag className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Candidate Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {tags.length > 0 ? (
                tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 rounded-full"
                      onClick={() => onRemoveTag(candidateId, tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No tags yet. Add some below.</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input 
              value={newTag} 
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..." 
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button 
              size="sm" 
              className="h-8"
              onClick={handleAddTag}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Quick Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {predefinedTags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => onAddTag(candidateId, tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
