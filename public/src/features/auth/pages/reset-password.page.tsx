import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Check, CheckCircle, RefreshCw } from "lucide-react";
import { Input } from "../../../components/shared/Input";
import { Button } from "../../../components/shared/Button";
import { AuthLayout } from "../../../components/layout/AuthLayout";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1000);
  };

  if (done) {
    return (
      <AuthLayout title="Password reset!" subtitle="Your password has been successfully reset. Click below to log in."
        icon={CheckCircle}>
        <Button full onClick={() => navigate("/login")}>Back to Login</Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set new password" subtitle="Your new password must be different from your previous password."
      icon={Lock} showBack onBack={() => navigate("/forgot-password")}>
      <Input label="New Password" type="password" placeholder="Min 8 characters" value={password} onChange={setPassword} icon={Lock} required />
      <Input label="Confirm New Password" type="password" placeholder="Confirm password" value={confirm} onChange={setConfirm} icon={Lock} required />
      <Button full onClick={handleReset} disabled={loading || !password || password !== confirm} className="mt-1">
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {loading ? "Updating…" : "Reset Password"}
      </Button>
    </AuthLayout>
  );
}
