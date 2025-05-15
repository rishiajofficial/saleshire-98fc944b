
import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CandidateTagProps {
  tags: string[];
  candidateId: string;
  onAddTag?: (candidateId: string, tag: string) => void;
  onRemoveTag?: (candidateId: string, tag: string) => void;
}

export const CandidateTag: React.FC<CandidateTagProps> = ({
  tags,
  candidateId,
  onAddTag,
  onRemoveTag,
}) => {
  if (!tags || tags.length === 0) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="cursor-pointer inline-flex items-center">
            <Tag className="h-4 w-4 text-muted-foreground opacity-70" />
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-64 p-3">
          <div className="text-sm font-medium">No tags</div>
          <div className="text-xs text-muted-foreground mt-1 mb-3">
            Add tags to categorize this candidate
          </div>
          {onAddTag && (
            <div className="grid grid-cols-2 gap-1 text-xs">
              {["Experienced", "Junior", "Remote", "Local", "Technical", "Soft Skills"].map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline"
                  className="cursor-pointer hover:bg-muted justify-center"
                  onClick={() => onAddTag(candidateId, tag)}
                >
                  + {tag}
                </Badge>
              ))}
            </div>
          )}
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="cursor-pointer inline-flex items-center">
          <Tag className="h-4 w-4 text-blue-500" />
          <span className="ml-1 text-xs text-muted-foreground">
            {tags.length}
          </span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 p-3">
        <div className="text-sm font-medium mb-2">Tags</div>
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary"
              className="text-xs"
            >
              {tag}
              {onRemoveTag && (
                <span 
                  className="ml-1 cursor-pointer hover:text-red-500" 
                  onClick={() => onRemoveTag(candidateId, tag)}
                >
                  ×
                </span>
              )}
            </Badge>
          ))}
        </div>
        {onAddTag && (
          <div className="border-t pt-2 mt-2">
            <div className="text-xs text-muted-foreground mb-1">Add more tags:</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {["Experienced", "Junior", "Remote", "Local", "Technical", "Soft Skills"].map((tag) => (
                !tags.includes(tag) && (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className="cursor-pointer hover:bg-muted justify-center"
                    onClick={() => onAddTag(candidateId, tag)}
                  >
                    + {tag}
                  </Badge>
                )
              ))}
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};
