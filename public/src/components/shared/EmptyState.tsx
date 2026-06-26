import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({ title = "No data found", message = "There is nothing to display here yet." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
      <Inbox className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs mt-1">{message}</p>
    </div>
  );
}
