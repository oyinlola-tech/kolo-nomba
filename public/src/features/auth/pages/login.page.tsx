import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, RefreshCw, Users, Building2 } from "lucide-react";
import { AuthLayout } from "../../../components/layout/AuthLayout";
import { Input } from "../../../components/shared/Input";
import { Button } from "../../../components/shared/Button";
import { useAuth } from "../../../hooks/use-auth";
import type { UserRole } from "../../../types/auth.types";

type LoginMode = "member" | "cooperative";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<LoginMode>("member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    login.mutate(
      { email, password },
      {
        onSuccess: (result) => {
          const role = (result.user?.role ?? "MEMBER") as UserRole;
          if (role === "SUPER_ADMIN") {
            navigate("/ajo/admin/dashboard");
          } else if (role === "GROUP_ADMIN") {
            navigate("/group/admin/dashboard");
          } else {
            navigate("/member/home");
          }
        },
        onError: (err: Error) => {
          setError(err.message || "Invalid email or password");
        },
      },
    );
  };

  return (
    <AuthLayout
      title={mode === "member" ? "Welcome back" : "Welcome back, Admin"}
      subtitle={mode === "member" ? "Enter your details to access your account." : "Sign in to manage your cooperative."}
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => setMode("member")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            mode === "member"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Users className="w-4 h-4" />
          Member
        </button>
        <button
          onClick={() => setMode("cooperative")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            mode === "cooperative"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Cooperative
        </button>
      </div>

      <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} required />
      <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={setPassword} icon={Lock} required />
      <Button full type="submit" onClick={handleLogin} disabled={login.isPending}>
        {login.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
        {login.isPending ? "Signing in\u2026" : "Sign In"}
      </Button>
      <p className="text-center text-sm text-gray-500 dark:text-muted-foreground mt-5">
        Don&apos;t have an account?{" "}
        <button
          onClick={() => navigate(mode === "member" ? "/register" : "/register/cooperative")}
          className="text-primary font-semibold hover:underline"
        >
          {mode === "member" ? "Create one" : "Register your cooperative"}
        </button>
      </p>
    </AuthLayout>
  );
}
