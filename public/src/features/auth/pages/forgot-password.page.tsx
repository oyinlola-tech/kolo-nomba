import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { Input } from "../../../components/shared/Input";
import { Button } from "../../../components/shared/Button";
import { AuthLayout } from "../../../components/layout/AuthLayout";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle={`We sent a password reset link to ${email}`}
        icon={CheckCircle} showBack onBack={() => setSent(false)}>
        <Button full onClick={() => navigate("/reset-password")}>Open Reset Link</Button>
        <p className="text-sm text-gray-500 dark:text-muted-foreground mt-5 text-center">
          Didn&apos;t receive it?{" "}
          <button onClick={() => setSent(false)} className="text-primary font-semibold hover:underline">Try again</button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="No worries! Enter your email and we'll send you reset instructions."
      icon={Key} showBack onBack={() => navigate("/login")}>
      <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} required />
      <Button full onClick={() => setSent(true)} className="mt-1">
        <Mail className="w-4 h-4" /> Send Reset Link
      </Button>
    </AuthLayout>
  );
}
