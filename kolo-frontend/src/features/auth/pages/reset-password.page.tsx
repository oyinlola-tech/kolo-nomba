import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Mail, Lock, RefreshCw, ArrowLeft } from "lucide-react";
import { AuthLayout } from "../../../components/layout/AuthLayout";
import { Input } from "../../../components/shared/Input";
import { Button } from "../../../components/shared/Button";
import { resetPassword } from "../../../services/auth.service";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      setMessage("Password reset successfully! Redirecting to login\u2026");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter the code sent to your email and choose a new password.">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}
      {message && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm">{message}</div>
      )}

      <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} required />
      <Input label="Reset Code" type="text" placeholder="123456" value={code} onChange={setCode} icon={Lock} required />
      <Input label="New Password" type="password" placeholder="Min. 8 characters" value={newPassword} onChange={setNewPassword} icon={Lock} required />
      <Button full type="submit" onClick={handleSubmit} disabled={loading}>
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
        {loading ? "Resetting\u2026" : "Reset Password"}
      </Button>

      <button onClick={() => navigate("/login")} className="mt-5 flex items-center justify-center gap-1.5 text-sm text-gray-500 dark:text-muted-foreground hover:text-primary transition-colors mx-auto">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to login
      </button>
    </AuthLayout>
  );
}
