import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ShieldCheck, Check, RefreshCw } from "lucide-react";
import { Button } from "../../../components/shared/Button";
import { AuthLayout } from "../../../components/layout/AuthLayout";
import { setAccessToken } from "../../../api/client";
import { useAppStore } from "../../../app/store";
import * as authService from "../../../services/auth.service";
import type { UserRole } from "../../../types/auth.types";

export function VerifyOTPPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId") ?? "";
  const [email] = useState(() => sessionStorage.getItem("verifyEmail") ?? "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const setSession = useAppStore((state) => state.setSession);

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp]; next[i] = v;
    setOtp(next);
    if (v && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus();
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await authService.verifyOtp({ userId, code: otp.join("") });
      setAccessToken(result.accessToken);
      setSession(result.user, result.accessToken);
      const role = result.role as UserRole;
      const target = role === "SUPER_ADMIN" ? "/ajo/admin/dashboard" : role === "GROUP_ADMIN" ? "/group/admin/dashboard" : "/member/home";
      navigate(target, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Verification failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await authService.resendOtp(userId);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to resend code";
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle={`We sent a 6-digit code to ${email ? email.replace(/(.{3}).+(@.+)/, "$1•••$2") : "your email"}`}
      icon={ShieldCheck} showBack onBack={() => navigate("/register")}>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-2.5 justify-center mb-6">
        {otp.map((d, i) => (
          <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => { if (e.key === "Backspace" && !otp[i] && i > 0) (document.getElementById(`otp-${i - 1}`) as HTMLInputElement)?.focus(); }}
            className="w-11 h-13 text-center text-lg font-bold border-2 border-gray-200 dark:border-border rounded-xl focus:outline-none focus:border-primary dark:bg-input-background dark:text-white transition-all" />
        ))}
      </div>
      <Button full onClick={handleVerify} disabled={loading || otp.some(d => !d) || !userId} className="mb-4">
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {loading ? "Verifying\u2026" : "Verify Code"}
      </Button>
      <p className="text-sm text-gray-500 dark:text-muted-foreground text-center">
        Didn&apos;t receive it?{" "}
        <button disabled={resending} onClick={handleResend}
          className={`font-semibold ${resending ? "text-gray-400 cursor-not-allowed" : "text-primary hover:underline"}`}>
          {resending ? "Sending\u2026" : "Resend code"}
        </button>
      </p>
    </AuthLayout>
  );
}
