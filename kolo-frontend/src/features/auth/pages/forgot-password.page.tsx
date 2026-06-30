import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { AuthLayout } from "../../../components/layout/AuthLayout";
import { Input } from "../../../components/shared/Input";
import { Button } from "../../../components/shared/Button";
import { forgotPassword } from "../../../services/auth.service";
import { extractApiError } from "../../../utils/error";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setMessage("If an account with that email exists, a reset code has been sent.");
    } catch (err) {
      setError(extractApiError(err, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email to receive a reset code.">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}
      {message && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm">{message}</div>
      )}

      <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} required />
      <Button full type="submit" onClick={handleSubmit} disabled={loading}>
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
        {loading ? "Sending\u2026" : "Send Reset Code"}
      </Button>

      <button onClick={() => navigate("/login")} className="mt-5 flex items-center justify-center gap-1.5 text-sm text-gray-500 dark:text-muted-foreground hover:text-primary transition-colors mx-auto">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to login
      </button>
    </AuthLayout>
  );
}
