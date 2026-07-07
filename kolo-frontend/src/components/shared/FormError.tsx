import { AlertCircle, X } from "lucide-react";

interface FieldErrors {
  [field: string]: string;
}

interface FormErrorProps {
  message: string;
  fieldErrors?: FieldErrors;
  onDismiss?: () => void;
}

export function FormError({ message, fieldErrors, onDismiss }: FormErrorProps) {
  if (!message) return null;
  return (
    <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">{message}</p>
          {fieldErrors && Object.keys(fieldErrors).length > 0 && (
            <ul className="mt-2 space-y-1">
              {Object.entries(fieldErrors).map(([field, msg]) => (
                <li key={field} className="text-xs text-red-600 dark:text-red-300 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                  {msg}
                </li>
              ))}
            </ul>
          )}
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function parseFieldErrors(errors?: string[]): FieldErrors {
  if (!errors) return {};
  const map: FieldErrors = {};
  for (const entry of errors) {
    const colon = entry.indexOf(": ");
    if (colon > 0) {
      map[entry.slice(0, colon)] = entry.slice(colon + 2);
    }
  }
  return map;
}
