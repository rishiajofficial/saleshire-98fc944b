
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  subMessage?: string;
  size?: "small" | "medium" | "large";
}

const Loading: React.FC<LoadingProps> = ({ 
  message = "Loading...", 
  subMessage,
  size = "medium"
}) => {
  const sizeClass = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12"
  };
  
  const containerClass = {
    small: "h-[30vh]",
    medium: "h-[60vh]",
    large: "h-screen"
  };

  return (
    <div className={`flex items-center justify-center ${containerClass[size]}`}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className={`${sizeClass[size]} animate-spin text-primary`} />
        <div className="text-center">
          <p className={`${size === "large" ? "text-lg" : "text-base"} text-muted-foreground`}>{message}</p>
          {subMessage && (
            <p className="text-sm text-muted-foreground mt-1">{subMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Loading;
