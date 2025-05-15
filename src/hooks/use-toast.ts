
import { toast as sonnerToast, Toast as SonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function toast({ title, description, variant }: ToastProps) {
  const isDestructive = variant === "destructive";
  
  if (isDestructive) {
    return sonnerToast.error(title, {
      description,
    });
  }
  
  return sonnerToast(title, {
    description,
  });
}

export const useToast = () => {
  return {
    toast,
  };
};
