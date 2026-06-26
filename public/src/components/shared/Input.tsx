import { useState, type ReactNode, type ElementType } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  icon?: ElementType;
  hint?: string;
  required?: boolean;
  right?: ReactNode;
}

export function Input({ label, type = "text", placeholder, value = "", onChange, icon: Icon, hint, required, right }: InputProps) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  const inputType = isPass ? (show ? "text" : "password") : type;
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"><Icon className="w-4 h-4" /></div>}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} ${isPass ? "pr-10" : right ? "pr-10" : "pr-4"} py-2.5 border border-gray-200 dark:border-border rounded-xl text-sm text-gray-900 dark:text-foreground bg-white dark:bg-input-background placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all`}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        {right && !isPass && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
      {hint && <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{hint}</p>}
    </div>
  );
}
