import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
