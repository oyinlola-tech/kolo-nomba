import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, RefreshCw, ShieldCheck } from "lucide-react";
import { AuthLayout } from "../../../components/layout/AuthLayout";
import { Input } from "../../../components/shared/Input";
import { Button } from "../../../components/shared/Button";
import { FormError } from "../../../components/shared/FormError";
import { useAuth } from "../../../hooks/use-auth";
import { parseApiError } from "../../../utils/error";
import type { UserRole } from "../../../types/auth.types";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ message: string; fieldErrors?: Record<string, string> } | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const handleLogin = async () => {
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError({ message: "Please enter a valid email address", fieldErrors: { email: "Enter a valid email address" } });
      return;
    }
    if (!password) {
      setError({ message: "Password is required", fieldErrors: { password: "Enter your password" } });
      return;
    }
    login.mutate(
      { email: trimmedEmail, password },
      {
        onSuccess: (result) => {
          if ("challengeId" in result) {
            navigate(`/verify-otp?userId=${result.challengeId}&email=${encodeURIComponent(trimmedEmail)}&mode=login`);
            return;
          }
          const allowed: UserRole[] = ["SUPER_ADMIN", "GROUP_ADMIN", "MEMBER"];
          const role = allowed.includes(result.user?.role ?? "MEMBER") ? result.user!.role : "MEMBER";
          if (role === "SUPER_ADMIN") {
            navigate("/ajo/admin/dashboard");
          } else if (role === "GROUP_ADMIN") {
            navigate("/group/admin/dashboard");
          } else {
            navigate("/member/home");
          }
        },
        onError: (err) => {
          const parsed = parseApiError(err, "Invalid email or password");
          setError(parsed);
        },
      },
    );
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your details to access your account."
    >
      {error && (
        <FormError message={error.message} fieldErrors={error.fieldErrors} onDismiss={clearError} />
      )}

      <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} required />
      <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={setPassword} icon={Lock} required />

      <div className="flex items-center justify-between mb-5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 dark:border-border text-primary focus:ring-primary" />
          <span className="text-xs text-gray-500 dark:text-muted-foreground">Remember me</span>
        </label>
        <button onClick={() => navigate("/forgot-password")} className="text-xs font-semibold text-primary hover:underline">
          Forgot password?
        </button>
      </div>

      <Button full type="submit" onClick={handleLogin} disabled={login.isPending}>
        {login.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
        {login.isPending ? "Signing in..." : "Sign In"}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-background px-3 text-gray-400">or</span>
        </div>
      </div>

      <Button full variant="secondary" onClick={() => navigate("/demo")}>
        <ShieldCheck className="w-4 h-4" />
        Try Demo Mode
      </Button>

      <p className="text-center text-sm text-gray-500 dark:text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <button onClick={() => navigate("/register")} className="text-primary font-semibold hover:underline">
          Create one
        </button>
      </p>
    </AuthLayout>
  );
}