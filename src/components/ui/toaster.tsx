
import { useToast } from "@/hooks/use-toast"
import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  // We're not actually using toasts from useToast anymore
  // since we're using Sonner's built-in toaster component
  return (
    <SonnerToaster 
      position="bottom-right"
      toastOptions={{
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))"
        },
      }}
    />
  )
}
