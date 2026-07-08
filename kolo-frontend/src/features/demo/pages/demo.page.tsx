import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Shield, Building2, Users, ShieldCheck, Zap, Check, X, Clock,
  ArrowRight, RefreshCw, Menu, Mail, Lock, KeyRound,
  Eye, EyeOff, Info, Database, Globe, Smartphone,
} from "lucide-react";
import { Logo } from "../../../components/shared/Logo";
import { Button } from "../../../components/shared/Button";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { useAppStore } from "../../../app/store";
import { setAccessToken } from "../../../api/client";
import { DEMO_USERS, DEMO_OTP_CODES } from "../data/demo-data";
import type { DemoUserConfig } from "../data/demo-data";
import { setActiveDemoUser, resetDemoData } from "../store/demo-store";

const ICON_MAP: Record<string, typeof Shield> = { Shield, Building2, Users };

type Step = "select" | "login" | "otp" | "success";

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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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
      setLoginError("Invalid password. Hint: All demo accounts use <strong>Demo@1234</strong>");
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

  const maskEmail = (email: string) => email.replace(/(.{3}).+(@.+)/, "$1••••$2");

  const Icon = selectedUser ? ICON_MAP[selectedUser.icon] || Shield : Shield;

  const features = [
    {
      id: "admin",
      icon: Shield,
      color: "violet",
      label: "Platform Admin",
      details: [
        "Full analytics dashboard with revenue & savings trends",
        "User management — view, verify, and manage accounts",
        "Group oversight — monitor all cooperatives",
        "Transaction & payment history with CSV export",
        "Security events monitoring & audit logs",
        "KYC verification queue (BVN/NIN submissions)",
        "Nomba payment gateway status & configuration",
        "Dispute resolution center",
        "Platform settings & notification preferences",
      ],
    },
    {
      id: "group",
      icon: Building2,
      color: "blue",
      label: "Group Admin",
      details: [
        "Dashboard with savings trends and payment analytics",
        "Member management — invite, view, and communicate",
        "Create and manage contribution plans & cycles",
        "Process payouts via multi-step wizard",
        "Contribution tracking — paid, pending, late statuses",
        "Payment analytics with collection rate metrics",
        "Transaction history per cooperative",
        "Group settings — profile, contribution rules",
        "Reports with savings & contributions charts",
      ],
    },
    {
      id: "member",
      icon: Users,
      color: "emerald",
      label: "Member",
      details: [
        "Personal dashboard with contribution summary & progress",
        "Virtual account number for bank transfer payments",
        "Pay contributions via card (simulated Nomba checkout) or bank transfer with auto-confirmation",
        "Payment health tracking (on-time vs late)",
        "Group management — view groups and member lists",
        "Full contribution history with receipt download",
        "In-app notifications with read/unread tracking",
        "Profile management & virtual account settings",
        "Withdrawal requests and dispute creation",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-background flex flex-col">
      {/* Nav */}
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
            <div className="text-center mb-8 lg:mb-10">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-5 shadow-lg">
                <KeyRound className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 lg:mb-3">
                Platform Demo
              </h1>
              <p className="text-gray-500 dark:text-muted-foreground max-w-lg mx-auto text-sm">
                Explore Kolo from every perspective. Pick a role below to see the full platform — no sign-up required.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
              {DEMO_USERS.map((u) => {
                const I = ICON_MAP[u.icon] || Shield;
                return (
                  <div key={u.user.id} className="rounded-2xl border border-gray-200 dark:border-border bg-white dark:bg-card p-5 lg:p-6 flex flex-col hover:shadow-lg transition-shadow">
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
                        <span className="text-gray-700 dark:text-gray-300 font-medium">••••••••••</span>
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

            {/* Expanded explanation section */}
            <div className="mt-8 lg:mt-10 space-y-3">
              {features.map((f) => (
                <div key={f.id} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl lg:rounded-2xl overflow-hidden">
                  <button onClick={() => setExpandedSection(expandedSection === f.id ? null : f.id)}
                    className="w-full flex items-center justify-between p-4 lg:p-5 hover:bg-gray-50 dark:hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        f.color === "violet" ? "bg-violet-50 dark:bg-violet-900/20" :
                        f.color === "blue" ? "bg-blue-50 dark:bg-blue-900/20" :
                        "bg-emerald-50 dark:bg-emerald-900/20"
                      }`}>
                        <f.icon className={`w-4 h-4 ${
                          f.color === "violet" ? "text-violet-600 dark:text-violet-400" :
                          f.color === "blue" ? "text-blue-600 dark:text-blue-400" :
                          "text-emerald-600 dark:text-emerald-400"
                        }`} />
                      </div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{f.label} — What you can explore</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === f.id ? "rotate-180" : ""}`} />
                  </button>
                  {expandedSection === f.id && (
                    <div className="px-4 lg:px-5 pb-4 lg:pb-5 border-t border-gray-100 dark:border-border">
                      <ul className="pt-3 space-y-1.5">
                        {f.details.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-muted-foreground">
                            <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                              f.color === "violet" ? "text-violet-500" :
                              f.color === "blue" ? "text-blue-500" :
                              "text-emerald-500"
                            }`} />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Demo metadata + reset */}
            <div className="mt-6 lg:mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 dark:text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-amber-500" />
                <span>All data simulated locally in your browser</span>
              </div>
              <span className="hidden sm:inline">&middot;</span>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-500" />
                <span>Zero backend required</span>
              </div>
              <span className="hidden sm:inline">&middot;</span>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span>Works fully offline</span>
              </div>
              <span className="hidden sm:inline">&middot;</span>
              <button onClick={() => setShowResetConfirm(true)} className="text-red-500 hover:underline flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Reset demo data
              </button>
            </div>

            {/* Tech details */}
            <div className="mt-6 bg-gray-50 dark:bg-muted/50 rounded-2xl p-5 border border-gray-100 dark:border-border">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-amber-500" />
                How the demo works
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-white dark:bg-card rounded-xl p-3 border border-gray-100 dark:border-border">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Data Layer</p>
                  <p className="text-gray-500">All data stored in localStorage. Your changes persist until you reset.</p>
                </div>
                <div className="bg-white dark:bg-card rounded-xl p-3 border border-gray-100 dark:border-border">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">API Layer</p>
                  <p className="text-gray-500">Axios interceptor detects <code>demo-token-</code> prefix and routes to a local handler. All endpoints mocked.</p>
                </div>
                <div className="bg-white dark:bg-card rounded-xl p-3 border border-gray-100 dark:border-border">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Payment Simulation</p>
                  <p className="text-gray-500">Card payments redirect to a simulated Nomba checkout. Bank transfers auto-confirm after 5s.</p>
                </div>
                <div className="bg-white dark:bg-card rounded-xl p-3 border border-gray-100 dark:border-border">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Tech Stack</p>
                  <p className="text-gray-500">React + TypeScript + Vite + Tailwind CSS + TanStack Query + Zustand + Axios</p>
                </div>
              </div>
            </div>

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
          </>
        )}

        {step === "login" && selectedUser && (
          <div className="max-w-md mx-auto w-full">
            <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-md">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1 text-center">
                {selectedUser.label} Login
              </h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6 text-center">
                Enter your credentials to continue
              </p>

              {loginError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl mb-4 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                  <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: loginError }} />
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
                {loggingIn ? "Signing in..." : "Login"}
              </Button>

              <div className="bg-gray-50 dark:bg-muted rounded-xl p-3.5">
                <p className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Info className="w-3 h-3" />
                  Demo credentials
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{selectedUser.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Password</span>
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
                Back to login
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
    </div>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
