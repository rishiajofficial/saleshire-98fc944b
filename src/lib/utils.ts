
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(duration: string | undefined): string {
  if (!duration) return 'N/A';
  
  // If the duration is already formatted, return it
  if (duration.includes(':')) return duration;
  
  // Try to convert number of seconds to mm:ss format
  try {
    const seconds = parseInt(duration);
    if (isNaN(seconds)) return duration;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  } catch (e) {
    return duration;
  }
}
