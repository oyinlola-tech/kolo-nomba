import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 dark:text-red-400 text-2xl font-bold">!</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-gray-500 dark:text-muted-foreground text-sm mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
