import { useNavigate } from "react-router";
import { Home } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gray-50 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl font-extrabold text-gray-300 dark:text-gray-600">404</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Page not found</h1>
        <p className="text-gray-500 dark:text-muted-foreground text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <button onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
          <Home className="w-4 h-4" />Go Home
        </button>
      </div>
    </div>
  );
}
