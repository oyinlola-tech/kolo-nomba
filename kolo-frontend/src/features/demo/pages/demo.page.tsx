import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Shield, Building2, Users, ShieldCheck, Zap, Check, X, Clock,
  ArrowRight, RefreshCw, Menu, Mail, Lock, KeyRound,
  Eye, EyeOff, Info, Database, Globe, Smartphone, CreditCard,
} from "lucide-react";
import { Logo } from "../../../components/shared/Logo";
import { Button } from "../../../components/shared/Button";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { useAppStore } from "../../../app/store";
import { setAccessToken } from "../../../api/client";
import { DEMO_USERS, DEMO_OTP_CODES, DEMO_PAYMENT_CARDS } from "../data/demo-data";
import type { DemoUserConfig, DemoPaymentCard } from "../data/demo-data";
import { setActiveDemoUser, resetDemoData } from "../store/demo-store";

const ICON_MAP: Record<string, typeof Shield> = { Shield, Building2, Users };

type Step = "select" | "login" | "otp" | "success";

function CardVisual({ card }: { card: DemoPaymentCard }) {
  return (
    <div className={`relative bg-gradient-to-br ${card.gradient} rounded-2xl p-5 text-white w-full max-w-[340px] h-[200px] shadow-xl flex flex-col justify-between overflow-hidden`}>
      <div className="absolute top-3 right-3 w-20 h-20 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
      <div className="flex items-start justify-between relative z-10">
        <span className="text-emerald-200/80 text-[10px] font-medium tracking-wider">KOLO SAVINGS</span>
        <span className="text-[10px] font-semibold text-white/80 tracking-wider">{card.network}</span>
      </div>
      <div className="relative z-10 mt-auto">
        <p className="text-lg font-mono tracking-[4px]">{card.number}</p>
        <div className="flex gap-6 mt-3">
          <div>
            <p className="text-[9px] text-white/60 tracking-wider">EXPIRY</p>
            <p className="text-xs font-mono font-semibold">{card.expiry}</p>
          </div>
          <div>
            <p className="text-[9px] text-white/60 tracking-wider">CVV</p>
            <p className="text-xs font-mono font-semibold">{card.cvv}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemoPage() {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [step, setStep] = useState<Step>("select");
  const [selectedUser, setSelectedUser] = useState<DemoUserConfig | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<{ type: "wrong" | "expired"; message: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSelectRole = useCallback((user: DemoUserConfig) => {
    setSelectedUser(user);
    setLoginEmail(user.user.email);
    setLoginPassword("");
    setLoginError("");
    setOtp(["", "", "", "", "", ""]);
    setOtpError(null);
    setStep("login");
  }, []);

  const handleLoginSubmit = useCallback(async () => {
    if (!selectedUser) return;
    setLoggingIn(true);
    setLoginError("");
    await new Promise((r) => setTimeout(r, 600));
    if (loginPassword !== "Demo@1234") {
      setLoginError("Invalid password. All demo accounts use Demo@1234");
      setLoggingIn(false);
      return;
    }
    setStep("otp");
    setLoggingIn(false);
  }, [selectedUser, loginPassword]);

  const handleBack = useCallback(() => {
    if (step === "login") {
      setStep("select");
      setSelectedUser(null);
    } else {
      setStep("login");
      setOtp(["", "", "", "", "", ""]);
      setOtpError(null);
    }
  }, [step]);

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
    setActiveDemoUser(selectedUser.user.id);
    setSession(selectedUser.user, token);
    setStep("success");
    setTimeout(() => navigate(selectedUser.dashboardPath, { replace: true }), 600);
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      document.getElementById(`demo-otp-${i - 1}`)?.focus();
    }
  };

  const handleResetData = () => {
    resetDemoData();
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background flex flex-col">
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
              <button onClick={() => navigate("/demo")} className="text-sm font-medium text-amber-600 dark:text-amber-400">Demo</button>
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

      <section className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        {step === "select" && (
          <>
            <div className="text-center mb-10">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                Try Kolo Without Signing Up
              </h1>
              <p className="text-gray-500 dark:text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
                Explore every feature from any role. No account needed, no data stored on servers — everything runs locally in your browser.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 lg:gap-5 mb-12">
              {DEMO_USERS.map((u) => {
                const I = ICON_MAP[u.icon] || Shield;
                return (
                  <div key={u.user.id} className="rounded-2xl border border-gray-200 dark:border-border bg-white dark:bg-card p-5 lg:p-6 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                      u.user.role === "SUPER_ADMIN" ? "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400" :
                      u.user.role === "GROUP_ADMIN" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      <I className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{u.label}</h3>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground mb-4 flex-1 leading-relaxed">{u.description}</p>
                    <div className="bg-gray-50 dark:bg-muted rounded-xl p-3 mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{u.user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">All use: Demo@1234</span>
                      </div>
                    </div>
                    <Button full onClick={() => handleSelectRole(u)}>
                      Continue as {u.label.split(" ")[0]}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Test Payment Cards */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Test Payment Cards</h2>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">Use these cards during card payment to simulate different outcomes</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
                {DEMO_PAYMENT_CARDS.map((card) => (
                  <div key={card.id} className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-4 lg:p-5">
                    <CardVisual card={card} />
                    <div className="mt-4 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-muted-foreground">OTP to enter</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">{card.otpToUse}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-muted-foreground">Outcome</span>
                        <span className={`font-semibold ${
                          card.result === "success" ? "text-emerald-600 dark:text-emerald-400" :
                          card.result === "wrong" ? "text-red-500" : "text-amber-600 dark:text-amber-400"
                        }`}>
                          {card.result === "success" ? "Payment succeeds" : card.result === "wrong" ? "Wrong OTP error" : "Expired OTP error"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OTP Reference */}
            <div className="mb-12 bg-gray-50 dark:bg-muted/50 rounded-2xl p-5 lg:p-6 border border-gray-100 dark:border-border">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                <KeyRound className="w-4 h-4 text-amber-500" />
                OTP Codes Reference
              </h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {DEMO_OTP_CODES.map((c) => (
                  <div key={c.code} className="bg-white dark:bg-card rounded-xl p-3.5 border border-gray-100 dark:border-border">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">{c.code}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        c.result === "success" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" :
                        c.result === "wrong" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      }`}>
                        {c.result === "success" ? "Success" : c.result === "wrong" ? "Wrong" : "Expired"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Demo metadata + reset */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 dark:text-muted-foreground mb-6">
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-amber-500" />
                <span>Data stays in your browser</span>
              </div>
              <span className="hidden sm:inline">&middot;</span>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-500" />
                <span>Zero backend needed</span>
              </div>
              <span className="hidden sm:inline">&middot;</span>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span>Works offline</span>
              </div>
              <span className="hidden sm:inline">&middot;</span>
              <button onClick={() => setShowResetConfirm(true)} className="text-red-500 hover:underline flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Reset data
              </button>
            </div>

            {/* How it works */}
            <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-5 lg:p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-amber-500" />
                How the demo works
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-gray-50 dark:bg-muted/50 rounded-xl p-3.5 border border-gray-100 dark:border-border">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Data Layer</p>
                  <p className="text-gray-500 dark:text-muted-foreground">All data stored in localStorage. Changes persist until you reset.</p>
                </div>
                <div className="bg-gray-50 dark:bg-muted/50 rounded-xl p-3.5 border border-gray-100 dark:border-border">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">API Layer</p>
                  <p className="text-gray-500 dark:text-muted-foreground">Axios interceptor detects demo tokens and routes to a local handler. All endpoints mocked.</p>
                </div>
                <div className="bg-gray-50 dark:bg-muted/50 rounded-xl p-3.5 border border-gray-100 dark:border-border">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Payments</p>
                  <p className="text-gray-500 dark:text-muted-foreground">Card payments redirect to a simulated Nomba checkout. Bank transfers auto-confirm after 5s.</p>
                </div>
                <div className="bg-gray-50 dark:bg-muted/50 rounded-xl p-3.5 border border-gray-100 dark:border-border">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Tech Stack</p>
                  <p className="text-gray-500 dark:text-muted-foreground">React + TypeScript + Vite + Tailwind CSS + TanStack Query + Zustand + Axios</p>
                </div>
              </div>
            </div>
          </>
        )}

        {step === "login" && selectedUser && (
          <div className="max-w-md mx-auto w-full">
            <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedUser.user.role === "SUPER_ADMIN" ? "bg-violet-50 dark:bg-violet-900/20 text-violet-600" :
                  selectedUser.user.role === "GROUP_ADMIN" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" :
                  "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                }`}>
                  {(() => {
                    const I = ICON_MAP[selectedUser.icon] || Shield;
                    return <I className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">{selectedUser.label} Login</h2>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">Enter credentials to continue</p>
                </div>
              </div>

              {loginError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl mb-4 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                  <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-1.5">Email</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-xl">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input type="email" value={loginEmail} readOnly
                      className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-1.5">Password</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl focus-within:border-primary transition-colors">
                    <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input type={showPassword ? "text" : "password"} value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLoginSubmit()}
                      placeholder="Enter password"
                      className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none placeholder-gray-400" />
                    <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button full onClick={handleLoginSubmit} disabled={loggingIn || !loginPassword} className="mb-5">
                {loggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loggingIn ? "Signing in..." : "Sign In"}
              </Button>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3.5">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                  <Info className="w-3 h-3" />
                  Demo credentials
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-amber-600/70 dark:text-amber-400/70">Email</span>
                    <span className="font-mono font-bold text-amber-800 dark:text-amber-300">{selectedUser.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-600/70 dark:text-amber-400/70">Password</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Demo@1234</span>
                  </div>
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

        {step === "otp" && selectedUser && (
          <div className="max-w-md mx-auto w-full">
            <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1 text-center">
                Verify Login
              </h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6 text-center">
                We sent a 6-digit code to {selectedUser.user.email.replace(/(.{3}).+(@.+)/, "$1****$2")}
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
                {verifying ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="bg-gray-50 dark:bg-muted rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-3 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  Sample OTP codes
                </p>
                <div className="grid gap-2">
                  {DEMO_OTP_CODES.map((c) => (
                    <div key={c.code} className="flex items-center justify-between text-xs bg-white dark:bg-card rounded-lg px-3 py-2 border border-gray-100 dark:border-border">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          c.result === "success" ? "bg-emerald-500" :
                          c.result === "wrong" ? "bg-red-500" : "bg-amber-500"
                        }`} />
                        <span className="font-mono font-bold text-gray-900 dark:text-white">{c.code}</span>
                      </div>
                      <span className={`text-[11px] ${
                        c.result === "success" ? "text-emerald-600 dark:text-emerald-400" :
                        c.result === "wrong" ? "text-red-500" : "text-amber-600 dark:text-amber-400"
                      }`}>
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
                Back to login
              </button>
            </div>
          </div>
        )}

        {step === "success" && selectedUser && (
          <div className="max-w-sm mx-auto text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50 dark:ring-emerald-900/10">
              <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Login successful!
            </h2>
            <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6">
              Redirecting to {selectedUser.label} dashboard...
            </p>
            <p className="text-xs text-gray-400 dark:text-muted-foreground">
              All data is simulated. No real transactions will be processed.
            </p>
          </div>
        )}
      </section>

      <footer className="border-t border-gray-100 dark:border-border py-8 bg-gray-50 dark:bg-card/50">
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

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-white dark:bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Reset Demo Data?</h3>
            <p className="text-sm text-gray-500 dark:text-muted-foreground mb-5">This will reset all demo data to its initial state. Any changes made during this session will be lost.</p>
            <div className="flex gap-3">
              <Button full variant="secondary" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
              <Button full variant="danger" onClick={handleResetData}>Reset Data</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}