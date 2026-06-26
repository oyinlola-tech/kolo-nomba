import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  full?: boolean;
}

export function Button({ children, onClick, variant = "primary", size = "md", className = "", type = "button", disabled = false, full = false }: ButtonProps) {
  const v = {
    primary:   "bg-primary hover:opacity-90 text-primary-foreground shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:opacity-80 border border-border",
    ghost:     "bg-transparent hover:bg-muted text-foreground",
    danger:    "bg-red-600 hover:bg-red-700 text-white shadow-sm",
    outline:   "bg-transparent border border-primary text-primary hover:bg-primary hover:text-white",
  }[variant];
  const s = { sm: "px-3 py-1.5 text-xs gap-1.5", md: "px-4 py-2.5 text-sm gap-2", lg: "px-6 py-3 text-base gap-2" }[size];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 ${v} ${s} ${full ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}>
      {children}
    </button>
  );
}
