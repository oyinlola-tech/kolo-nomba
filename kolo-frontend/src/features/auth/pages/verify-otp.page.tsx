import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ShieldCheck, Check, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "../../../components/shared/Button";
import { AuthLayout } from "../../../components/layout/AuthLayout";
import { setAccessToken } from "../../../api/client";
import { useAppStore } from "../../../app/store";
import * as authService from "../../../services/auth.service";
import { extractApiError } from "../../../utils/error";
import type { UserRole } from "../../../types/auth.types";

const RETRY_COOLDOWN = 60;

export function VerifyOTPPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId") ?? "";
  const mode = searchParams.get("mode") ?? "register";
  const [email] = useState(() => searchParams.get("email") ?? sessionStorage.getItem("verifyEmail") ?? "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(RETRY_COOLDOWN);
  const setSession = useAppStore((state) => state.setSession);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const resetCooldown = useCallback(() => {
    setCountdown(RETRY_COOLDOWN);
    setResending(false);
  }, []);

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
      const result = mode === "login"
        ? await authService.verifyLoginOtp(userId, otp.join(""))
        : await authService.verifyOtp({ userId, code: otp.join("") });
      setAccessToken(result.accessToken);
      setSession(result.user, result.accessToken);
      const allowed: UserRole[] = ["SUPER_ADMIN", "GROUP_ADMIN", "MEMBER"];
      const role = allowed.includes(result.role) ? result.role : "MEMBER";
      const target = role === "SUPER_ADMIN" ? "/ajo/admin/dashboard" : role === "GROUP_ADMIN" ? "/group/admin/dashboard" : "/member/home";
      navigate(target, { replace: true });
    } catch (err: unknown) {
      setError(extractApiError(err, "Verification failed"));
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
      setError(extractApiError(err, "Failed to resend code"));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title={mode === "login" ? "Verify login" : "Verify your email"} subtitle={`We sent a 6-digit code to ${email ? email.replace(/(.{3}).+(@.+)/, "$1•••$2") : "your email"}`}
      icon={ShieldCheck} showBack onBack={() => navigate(mode === "login" ? "/login" : "/register")}>
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
      <div className="flex flex-col items-center gap-3 mt-4">
        {countdown > 0 && resending ? (
          <p className="text-sm text-gray-500 dark:text-muted-foreground">
            Resending in {countdown}s&hellip;
          </p>
        ) : null}
        {mode === "login" ? (
          <>
            <button
              disabled={countdown > 0}
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-primary hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {countdown > 0 ? `Retry in ${countdown}s` : "Resend code"}
            </button>
            <button onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-primary flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Try logging in again
            </button>
          </>
        ) : (
          <button disabled={resending || countdown > 0} onClick={() => { handleResend().finally(resetCooldown); }}
            className={`text-sm font-semibold ${resending || countdown > 0 ? "text-gray-400 cursor-not-allowed" : "text-primary hover:underline"}`}>
            {resending ? "Sending\u2026" : countdown > 0 ? `Resend code (${countdown}s)` : "Resend code"}
          </button>
        )}
      </div>
    </AuthLayout>
  );
}
