import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/use-theme";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle}
      className={`p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-all ${className}`}
      aria-label="Toggle theme">
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
