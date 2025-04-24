
interface VideoDisplayProps {
  url: string | null | undefined;
  title: string;
}

export const VideoDisplay = ({ url, title }: VideoDisplayProps) => {
  if (!url) {
    return <p className="text-sm text-muted-foreground">No {title} submitted.</p>;
  }

  return (
    <div>
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline flex items-center gap-1"
      >
        <Video className="h-4 w-4" /> Watch {title}
      </a>
    </div>
  );
};
