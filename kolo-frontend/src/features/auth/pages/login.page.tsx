import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, RefreshCw } from "lucide-react";
import { AuthLayout } from "../../../components/layout/AuthLayout";
import { Input } from "../../../components/shared/Input";
import { Button } from "../../../components/shared/Button";
import { useAuth } from "../../../hooks/use-auth";
import type { UserRole } from "../../../types/auth.types";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    login.mutate(
      { email: trimmedEmail, password },
      {
        onSuccess: (result) => {
          if ("challengeId" in result) {
            navigate(`/verify-login?userId=${result.challengeId}&email=${encodeURIComponent(trimmedEmail)}`);
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
        onError: (err: Error) => {
          setError(err.message || "Invalid email or password");
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
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} required />
      <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={setPassword} icon={Lock} required />
      <Button full type="submit" onClick={handleLogin} disabled={login.isPending}>
        {login.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
        {login.isPending ? "Signing in\u2026" : "Sign In"}
      </Button>
      <p className="text-center text-sm text-gray-500 dark:text-muted-foreground mt-5">
        Don&apos;t have an account?{" "}
        <button
          onClick={() => navigate("/register")}
          className="text-primary font-semibold hover:underline"
        >
          Create one
        </button>
      </p>
      <p className="text-center text-sm text-gray-500 dark:text-muted-foreground mt-2">
        <button onClick={() => navigate("/forgot-password")} className="text-primary font-semibold hover:underline">Forgot password?</button>
      </p>
    </AuthLayout>
  );
}
