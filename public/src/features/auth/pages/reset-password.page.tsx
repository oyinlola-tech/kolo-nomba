import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { AuthLayout } from "../../../components/layout/AuthLayout";

export function ResetPasswordPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout title="Reset password" subtitle="Password reset is not yet available."
      icon={Lock} showBack onBack={() => navigate("/forgot-password")}>
      <p className="text-sm text-gray-500 dark:text-muted-foreground text-center mb-4">
        Email <strong>support@kolo.app</strong> to request a password reset.
      </p>
      <a href="mailto:support@kolo.app" className="block w-full text-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all">
        <Mail className="w-4 h-4 inline mr-2" />Contact Support
      </a>
    </AuthLayout>
  );
}
