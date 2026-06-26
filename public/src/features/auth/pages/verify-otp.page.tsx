import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Check, RefreshCw } from "lucide-react";
import { Button } from "../../../components/shared/Button";
import { AuthLayout } from "../../../components/layout/AuthLayout";

export function VerifyOTPPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp]; next[i] = v;
    setOtp(next);
    if (v && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus();
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate("/member/home"); }, 1200);
  };

  return (
    <AuthLayout title="Verify your phone" subtitle={"We sent a 6-digit code to +234 801 234 ••••"}
      icon={ShieldCheck} showBack onBack={() => navigate("/register")}>
      <div className="flex gap-2.5 justify-center mb-6">
        {otp.map((d, i) => (
          <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => { if (e.key === "Backspace" && !otp[i] && i > 0) (document.getElementById(`otp-${i - 1}`) as HTMLInputElement)?.focus(); }}
            className="w-11 h-13 text-center text-lg font-bold border-2 border-gray-200 dark:border-border rounded-xl focus:outline-none focus:border-primary dark:bg-input-background dark:text-white transition-all" />
        ))}
      </div>
      <Button full onClick={handleVerify} disabled={loading || otp.some(d => !d)} className="mb-4">
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {loading ? "Verifying…" : "Verify Code"}
      </Button>
      <p className="text-sm text-gray-500 dark:text-muted-foreground text-center">
        Didn&apos;t receive it?{" "}
        <button disabled={resent} onClick={() => setResent(true)}
          className={`font-semibold ${resent ? "text-gray-400 cursor-not-allowed" : "text-primary hover:underline"}`}>
          {resent ? "Code sent!" : "Resend code"}
        </button>
      </p>
    </AuthLayout>
  );
}
