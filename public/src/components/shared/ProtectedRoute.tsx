import { type ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "../../app/store";
import type { UserRole } from "../../types/auth.types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

const AUTH_TIMEOUT_MS = 5000;

function AuthLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
    </div>
  );
}

export function ProtectedRoute({ children, allowedRoles, fallbackPath = "/login" }: ProtectedRouteProps) {
  const [timedOut, setTimedOut] = useState(false);
  const accessToken = useAppStore((state) => state.accessToken);
  const isHydrated = useAppStore((state) => state.isHydrated);
  const role = useAppStore((state) => state.role);

  useEffect(() => {
    if (isHydrated) return;
    const id = setTimeout(() => setTimedOut(true), AUTH_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [isHydrated]);

  if (!isHydrated) {
    if (timedOut) return <Navigate to={fallbackPath} replace />;
    return <AuthLoading />;
  }

  if (!accessToken) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    if (role === "SUPER_ADMIN") return <Navigate to="/ajo/admin/dashboard" replace />;
    if (role === "GROUP_ADMIN") return <Navigate to="/group/admin/dashboard" replace />;
    return <Navigate to="/member/home" replace />;
  }

  return <>{children}</>;
}
