import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong. Please try again.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
      <AlertTriangle className="w-12 h-12 mb-3 text-red-400" />
      <p className="text-sm font-semibold text-gray-900 dark:text-white">Error</p>
      <p className="text-xs mt-1 mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
