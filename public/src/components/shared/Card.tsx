import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}
