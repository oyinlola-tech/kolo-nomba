import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Shield, Building2, Users, ShieldCheck, Zap, Check, X, Clock,
  ArrowRight, RefreshCw, Menu, Mail, Lock, KeyRound,
} from "lucide-react";
import { Logo } from "../../../components/shared/Logo";
import { Button } from "../../../components/shared/Button";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { useAppStore } from "../../../app/store";
import { setAccessToken } from "../../../api/client";
import { DEMO_USERS, DEMO_OTP_CODES } from "../data/demo-data";
import type { DemoUserConfig } from "../data/demo-data";

const ICON_MAP: Record<string, typeof Shield> = { Shield, Building2, Users };

type Step = "select" | "logging" | "otp" | "success";

export function DemoPage() {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [step, setStep] = useState<Step>("select");
  const [selectedUser, setSelectedUser] = useState<DemoUserConfig | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<{ type: "wrong" | "expired"; message: string } | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (step === "logging" && selectedUser) {
      const timer = setTimeout(() => setStep("otp"), 1400);
      return () => clearTimeout(timer);
    }
  }, [step, selectedUser]);

  const handleSelectRole = useCallback((user: DemoUserConfig) => {
    setSelectedUser(user);
    setOtp(["", "", "", "", "", ""]);
    setOtpError(null);
    setStep("logging");
  }, []);

  const handleBack = useCallback(() => {
    setStep("select");
    setSelectedUser(null);
    setOtp(["", "", "", "", "", ""]);
    setOtpError(null);
  }, []);

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) document.getElementById(`demo-otp-${i + 1}`)?.focus();
  };

  const handleVerify = async () => {
    if (!selectedUser) return;
    const code = otp.join("");
    const match = DEMO_OTP_CODES.find((c) => c.code === code);
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 800));
    if (!match || match.result === "wrong") {
      setOtpError({ type: "wrong", message: match?.errorMessage ?? "Invalid verification code. Please check and try again." });
      setVerifying(false);
      return;
    }
    if (match.result === "expired") {
      setOtpError({ type: "expired", message: match.errorMessage! });
      setVerifying(false);
      return;
    }
    const token = `demo-token-${selectedUser.user.id}-${Date.now()}`;
    setAccessToken(token);
    setSession(selectedUser.user, token);
    setStep("success");
    setTimeout(() => navigate(selectedUser.dashboardPath, { replace: true }), 600);
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      document.getElementById(`demo-otp-${i - 1}`)?.focus();
    }
  };

  const maskEmail = (email: string) => email.replace(/(.{3}).+(@.+)/, "$1••••$2");

  const Icon = selectedUser ? ICON_MAP[selectedUser.icon] || Shield : Shield;

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-background/90 backdrop-blur-md border-b border-gray-100 dark:border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-16">
            <button onClick={() => navigate("/")}>
              <Logo />
            </button>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate("/how-it-works")} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">How It Works</button>
              <button onClick={() => navigate("/pricing")} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</button>
              <button onClick={() => navigate("/security")} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Security</button>
              <button onClick={() => navigate("/about")} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">About</button>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign In</Button>
              <Button size="sm" onClick={() => navigate("/register")}>Get Started</Button>
            </div>
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button onClick={() => setMobileMenu((m) => !m)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5">
                {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Platform Demo
          </h1>
          <p className="text-gray-500 dark:text-muted-foreground max-w-lg mx-auto">
            Explore Kolo from every perspective. Choose a role below to see the platform in action — no sign-up required.
          </p>
        </div>

        {step === "select" && (
          <div className="grid md:grid-cols-3 gap-5">
            {DEMO_USERS.map((u) => {
              const I = ICON_MAP[u.icon] || Shield;
              return (
                <div key={u.user.id} className="rounded-2xl border border-gray-200 dark:border-border bg-white dark:bg-card p-6 flex flex-col hover:shadow-lg transition-shadow">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                    u.user.role === "SUPER_ADMIN" ? "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400" :
                    u.user.role === "GROUP_ADMIN" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                    "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  }`}>
                    <I className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{u.label}</h3>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground mb-4 flex-1">{u.description}</p>
                  <div className="bg-gray-50 dark:bg-muted rounded-xl p-3 mb-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{u.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{u.password}</span>
                    </div>
                  </div>
                  <Button full onClick={() => handleSelectRole(u)}>
                    Login as {u.label.split(" ")[0]}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {step === "logging" && selectedUser && (
          <div className="max-w-sm mx-auto text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Signing in as {selectedUser.label}
            </h2>
            <p className="text-sm text-gray-500 dark:text-muted-foreground mb-8">
              {selectedUser.user.email}
            </p>
            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm text-gray-500 dark:text-muted-foreground mt-4">Authenticating&hellip;</p>
          </div>
        )}

        {step === "otp" && selectedUser && (
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1 text-center">
                Verify login
              </h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6 text-center">
                We sent a 6-digit code to {maskEmail(selectedUser.user.email)}
              </p>

              {otpError && (
                <div className={`flex items-start gap-2.5 p-3 rounded-xl mb-5 text-sm ${
                  otpError.type === "wrong"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                    : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                }`}>
                  {otpError.type === "wrong" ? <X className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  <span>{otpError.message}</span>
                </div>
              )}

              <div className="flex gap-2.5 justify-center mb-6">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`demo-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-13 text-center text-lg font-bold border-2 border-gray-200 dark:border-border rounded-xl focus:outline-none focus:border-primary dark:bg-input-background dark:text-white transition-all"
                  />
                ))}
              </div>

              <Button full onClick={handleVerify} disabled={verifying || otp.some((d) => !d)} className="mb-5">
                {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {verifying ? "Verifying\u2026" : "Verify Code"}
              </Button>

              <div className="bg-gray-50 dark:bg-muted rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-2 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  Sample OTP codes for demo
                </p>
                <div className="space-y-1.5">
                  {DEMO_OTP_CODES.map((c) => (
                    <div key={c.code} className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{c.code}</span>
                      <span className={`${c.result === "success" ? "text-emerald-600 dark:text-emerald-400" : c.result === "wrong" ? "text-red-500" : "text-amber-600 dark:text-amber-400"}`}>
                        {c.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-5">
              <button onClick={handleBack} className="text-sm text-gray-500 dark:text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 mx-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M19 12H5m7-7l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Choose a different role
              </button>
            </div>
          </div>
        )}

        {step === "success" && selectedUser && (
          <div className="max-w-sm mx-auto text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Login successful!
            </h2>
            <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6">
              Redirecting to {selectedUser.label} dashboard&hellip;
            </p>
            <div className="h-1.5 bg-gray-100 dark:bg-muted rounded-full overflow-hidden max-w-48 mx-auto">
              <div className="h-full bg-primary rounded-full animate-pulse w-full" />
            </div>
          </div>
        )}
      </section>

      <footer className="border-t border-gray-100 dark:border-border py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} KOLO Limited. Demo Mode</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full">
              <Zap className="w-3 h-3" />Demo Environment
            </span>
          </div>
          <p className="text-sm text-gray-500">No real transactions will be processed.</p>
        </div>
      </footer>
    </div>
  );
}
