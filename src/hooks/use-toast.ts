
import { toast as sonnerToast, Toast } from "sonner";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

export const toast = {
  toast: ({ title, description, variant, duration }: ToastProps): string | number => {
    if (variant === "destructive") {
      return sonnerToast.error(title, {
        description,
        duration: duration || 3000,
      });
    }

    if (variant === "success") {
      return sonnerToast.success(title, {
        description,
        duration: duration || 3000,
      });
    }

    return sonnerToast(title, {
      description,
      duration: duration || 3000,
    });
  },
  // Add empty array for toast.toasts to fix type error
  toasts: [] as Toast[],
};

export const useToast = () => {
  return { toast };
};
