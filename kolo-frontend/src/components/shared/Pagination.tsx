import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationInfo } from "../../types/platform.types";

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-border flex items-center justify-between text-xs text-gray-500 dark:text-muted-foreground">
      <span>
        Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.hasPrev}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              p === pagination.page
                ? "bg-primary text-white"
                : "text-gray-500 dark:text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted"
            }`}
            aria-label={`Page ${p}`}
            aria-current={p === pagination.page ? "page" : undefined}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasNext}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
