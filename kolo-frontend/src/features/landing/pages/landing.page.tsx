import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Star, Building2, ArrowRight, ShieldCheck, Zap, Globe,
  CreditCard, Users, BarChart2, Bell, ArrowDownToLine, Shield, Menu, X,
  UserPlus, Banknote, Check, BookOpen,
  Lock, Eye, Database, RefreshCw, Smartphone,
  TrendingUp, CheckCircle, AlertTriangle, Award,
} from "lucide-react";
import { Button } from "../../../components/shared/Button";
import { Card } from "../../../components/shared/Card";
import { Avatar } from "../../../components/shared/Avatar";
import { Badge } from "../../../components/shared/Badge";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { Logo } from "../../../components/shared/Logo";

export function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();

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
              <button onClick={() => setMobileMenu(m => !m)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5">
                {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-gray-100 dark:border-border bg-white dark:bg-card px-4 py-4 space-y-3">
            <button onClick={() => { navigate("/how-it-works"); setMobileMenu(false); }} className="block text-sm font-medium text-gray-600 dark:text-gray-400 py-1">How It Works</button>
            <button onClick={() => { navigate("/pricing"); setMobileMenu(false); }} className="block text-sm font-medium text-gray-600 dark:text-gray-400 py-1">Pricing</button>
            <button onClick={() => { navigate("/security"); setMobileMenu(false); }} className="block text-sm font-medium text-gray-600 dark:text-gray-400 py-1">Security</button>
            <button onClick={() => { navigate("/about"); setMobileMenu(false); }} className="block text-sm font-medium text-gray-600 dark:text-gray-400 py-1">About</button>
            <div className="pt-2 flex flex-col gap-2">
              <Button full variant="secondary" onClick={() => navigate("/login")}>Sign In</Button>
              <Button full onClick={() => navigate("/register")}>Get Started Free</Button>
            </div>
          </div>
        )}
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              Cooperative savings for the{" "}
              <span className="text-primary">modern African.</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Digital Ajo made secure, transparent, and effortless. Manage contributions, track members, and grow your collective wealth — all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => navigate("/register/cooperative")}>
                <Building2 className="w-5 h-5" />
                Create Cooperative
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate("/register")}>
                Join as Member
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6">
              {[
                { icon: ShieldCheck, label: "Bank-grade Security" },
                { icon: Zap, label: "Instant Settlements" },
                { icon: Globe, label: "Pan-African Coverage" },
              ].map(({ icon: I, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <I className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-full max-w-sm space-y-3">
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">Market Traders Ajo</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">24 active members</p>
                  </div>
                  <Badge status="active" />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 dark:bg-muted rounded-xl p-3">
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">Total Savings</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">₦850,000</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Next Payout</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">Jul 1</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    <span>Monthly Target</span><span>₦1,250,000</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: "68%" }} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">68% collected this month</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">AO</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Adaobi Okonkwo paid</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">₦50,000 · June contribution</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">✓ Paid</span>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-card border-y border-gray-100 dark:border-border py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { val: "₦1B+", label: "Total Processed" },
                { val: "100+", label: "Active Cooperatives" },
                { val: "10K+", label: "Members" },
                { val: "99.9%", label: "Uptime" },
              ].map(({ val, label }) => (
              <div key={label}>
                <p className="text-3xl font-extrabold text-primary">{val}</p>
                <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-primary tracking-widest uppercase mb-3 block">The Problem</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
              Traditional Ajo is powerful, but it has limits
            </h2>
            <div className="space-y-4">
              {[
                { icon: BookOpen, title: "Manual Records", desc: "Handwritten ledgers are error-prone, easy to lose, and impossible to audit at scale." },
                { icon: Eye, title: "Lack of Transparency", desc: "Members have no way to independently verify their savings or the group's total balance." },
                { icon: AlertTriangle, title: "Payment Tracking", desc: "Tracking who paid, who owes, and when payouts are due is a relentless manual effort." },
                { icon: RefreshCw, title: "Difficult Reconciliation", desc: "Reconciling member contributions with group totals takes hours of cross-checking." },
              ].map(({ icon: I, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <I className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase mb-3 block">The Solution</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
              Kolo digitizes everything
            </h2>
            <div className="space-y-4">
              {[
                { icon: Database, title: "Digital Contribution Tracking", desc: "Every payment is recorded in real-time. No more paper ledgers or manual calculations." },
                { icon: Zap, title: "Automated Payments", desc: "Members pay via Nomba-powered virtual accounts. Contributions are matched and confirmed instantly." },
                { icon: CheckCircle, title: "Transparent Records", desc: "Every member can view the full transaction history, group balance, and payout schedule." },
                { icon: Shield, title: "Secure Transactions", desc: "All funds are held in regulated financial institutions. Each transaction is verified end-to-end." },
              ].map(({ icon: I, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <I className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-card/50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">How Ajo works</h2>
            <p className="text-gray-600 dark:text-gray-400">Three simple steps to digitize your cooperative savings group.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create your cooperative", desc: "Register, set up your group details, contribution rules, and payment schedule in minutes.", icon: Building2 },
              { step: "02", title: "Invite your members", desc: "Share an invite link or add members directly. They receive a welcome SMS and onboarding guide.", icon: UserPlus },
              { step: "03", title: "Collect & disburse", desc: "Members pay via Nomba-powered virtual accounts. Funds are tracked automatically and payouts are one click away.", icon: Banknote },
            ].map(({ step, title, desc, icon: I }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <I className="w-7 h-7 text-white" />
                </div>
                <div className="text-xs font-bold text-primary mb-2 tracking-widest">STEP {step}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Powerful features for seamless management</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">Everything your cooperative needs to operate transparently and securely at scale.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
            { icon: CreditCard, title: "Automated Contribution Tracking", desc: "Say goodbye to manual ledgers. Track every member payment with immutable digital records and real-time confirmations.", color: "emerald" },
            { icon: Users, title: "Member Management", desc: "Onboard members, assign roles, set contribution tiers, and manage payout rotations — all in one place.", color: "blue" },
            { icon: BarChart2, title: "Financial Analytics", desc: "Get instant insights into savings growth, payment rates, and group performance through visual dashboards.", color: "violet" },
            { icon: Bell, title: "Smart Notifications", desc: "Automated reminders for upcoming payments, confirmations for successful contributions, and group announcements.", color: "amber" },
            { icon: ArrowDownToLine, title: "Instant Payouts", desc: "Schedule and process payouts directly to bank accounts. Full reconciliation powered by Nomba infrastructure.", color: "rose" },
            { icon: Shield, title: "Bank-grade Security", desc: "All funds are held securely through certified financial institutions. Every transaction is protected end-to-end.", color: "emerald" },
          ].map(({ icon: I, title, desc, color }) => (
            <Card key={title} className="p-6 hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                color === "emerald" ? "bg-emerald-50 dark:bg-emerald-900/20" :
                color === "blue"    ? "bg-blue-50 dark:bg-blue-900/20" :
                color === "violet"  ? "bg-violet-50 dark:bg-violet-900/20" :
                color === "amber"   ? "bg-amber-50 dark:bg-amber-900/20" :
                "bg-rose-50 dark:bg-rose-900/20"
              }`}>
                <I className={`w-5 h-5 ${
                  color === "emerald" ? "text-emerald-600 dark:text-emerald-400" :
                  color === "blue"    ? "text-blue-600 dark:text-blue-400" :
                  color === "violet"  ? "text-violet-600 dark:text-violet-400" :
                  color === "amber"   ? "text-amber-600 dark:text-amber-400" :
                  "text-rose-600 dark:text-rose-400"
                }`} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground leading-relaxed">{desc}</p>
            </Card>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 border-t-2 border-t-emerald-500">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" /> For Members</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {["Track your contributions in real-time", "Pay via mobile, USSD, or bank transfer", "View payment history and download receipts", "Receive payment reminders", "See group balance and payout schedule"].map(f => (
                <li key={f} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-6 border-t-2 border-t-blue-500">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-blue-500" /> For Group Admins</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {["Manage members and roles", "Track savings and contribution rates", "Approve payouts with one click", "Generate financial reports", "Send group announcements"].map(f => (
                <li key={f} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-6 border-t-2 border-t-violet-500">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-violet-500" /> For Businesses</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {["Manage communities at scale", "Monitor financial activity across groups", "Improve trust and transparency", "Reduce administrative overhead", "Access API for custom integrations"].map(f => (
                <li key={f} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-violet-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-card/50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-primary tracking-widest uppercase mb-3 block">Payment Infrastructure</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
                Enterprise-grade payment rails
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Kolo integrates with licensed payment infrastructure to provide secure, reliable fund collection and disbursement. All transactions are processed through regulated financial channels.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Banknote, title: "Payment Collection", desc: "Virtual accounts for every member. Payments are matched automatically." },
                  { icon: Smartphone, title: "Multiple Channels", desc: "Pay via transfer, USSD, card, or mobile money." },
                  { icon: ArrowDownToLine, title: "Instant Payouts", desc: "Disburse funds directly to member bank accounts." },
                  { icon: Database, title: "Transaction Records", desc: "Every payment is logged with full audit trail." },
                ].map(({ icon: I, title, desc }) => (
                  <div key={title} className="bg-white dark:bg-card p-4 rounded-xl border border-gray-100 dark:border-border">
                    <I className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{title}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Card className="p-5">
                <p className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Banknote className="w-4 h-4 text-emerald-500" />Payment Flow</p>
                <div className="space-y-4">
                  {[
                    { step: "1", label: "Member initiates payment via virtual account, transfer, or card" },
                    { step: "2", label: "Payment infrastructure confirms and reconciles the transaction" },
                    { step: "3", label: "Contribution is recorded and member receives confirmation" },
                    { step: "4", label: "Group balance updates in real-time for all members to see" },
                  ].map(({ step, label }) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400 flex-shrink-0">{step}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-last lg:order-first">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Lock, title: "End-to-End Encryption", desc: "All data is encrypted in transit and at rest using industry-standard protocols." },
                { icon: ShieldCheck, title: "Secure Authentication", desc: "Multi-factor authentication and role-based access control protect every account." },
                { icon: Eye, title: "Transaction Monitoring", desc: "Real-time monitoring detects suspicious activity and flags anomalies." },
                { icon: Database, title: "Audit Records", desc: "Every action is logged with timestamps and user attribution for full accountability." },
              ].map(({ icon: I, title, desc }) => (
                <Card key={title} className="p-4">
                  <I className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{title}</p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{desc}</p>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-primary tracking-widest uppercase mb-3 block">Security</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
              Built for trust from the ground up
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Kolo handles financial data with the highest security standards. Our platform is designed to protect member funds, personal information, and transaction records.
            </p>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              {[
                "All communication is encrypted with TLS 1.3",
                "Funds are held in licensed financial institutions",
                "Role-based access ensures data privacy",
                "Biometric authentication on mobile devices",
                "Regular third-party security audits",
                "SOC 2 compliance framework",
              ].map(f => (
                <li key={f} className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <Button variant="secondary" className="mt-6" onClick={() => navigate("/security")}>
              Learn more about security <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-12">Loved by cooperative leaders</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Chioma Eze", role: "Cooperative Admin, Lagos", text: "Kolo transformed our thrift group completely. No more arguments over records — everything is transparent and automated.", rating: 5 },
            { name: "Ibrahim Musa", role: "Community Leader, Kano", text: "We went from paper ledgers to digital management in one afternoon. Our members trust the system because they can see every transaction.", rating: 5 },
            { name: "Adaobi Okonkwo", role: "Member, Abuja", text: "Paying my monthly contribution takes 30 seconds. I get instant confirmation and my receipt is always in the app. Incredible product.", rating: 5 },
          ].map(({ name, role, text, rating }) => (
            <Card key={name} className="p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: rating }).map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5 italic">&ldquo;{text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <Avatar name={name} />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">{role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-card/50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-600 dark:text-gray-400">Start free, upgrade as you grow. Only pay transaction fees when your members contribute.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6">
              <Award className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mb-2" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Free</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mb-3">For small community groups</p>
              <div className="flex items-end gap-1 my-3">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₦0</span>
                <span className="text-gray-500 dark:text-muted-foreground mb-1 text-sm">forever</span>
              </div>
              <ul className="space-y-2 mb-5 text-sm text-gray-600 dark:text-gray-400">
                {["Up to 15 members", "1 group", "Basic contribution tracking", "Manual payment recording"].map(f => (
                  <li key={f} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Button full variant="secondary" onClick={() => navigate("/register")}>Get Started Free</Button>
            </Card>
            <Card className="p-6 border-primary/40 bg-emerald-50/30 dark:bg-emerald-900/5 ring-1 ring-primary/20 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
              <TrendingUp className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mb-2" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Growth</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mb-3">For serious cooperative groups</p>
              <div className="flex items-end gap-1 my-3">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₦9,500</span>
                <span className="text-gray-500 dark:text-muted-foreground mb-1 text-sm">/month</span>
              </div>
              <ul className="space-y-2 mb-5 text-sm text-gray-600 dark:text-gray-400">
                {["Up to 100 members", "3 groups", "Virtual accounts via Nomba", "Automated payment tracking", "SMS & email notifications"].map(f => (
                  <li key={f} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Button full onClick={() => navigate("/register/cooperative")}>Start Free Trial</Button>
            </Card>
            <Card className="p-6">
              <Building2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mb-2" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Business</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mb-3">For organizations &amp; associations</p>
              <div className="flex items-end gap-1 my-3">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">Custom</span>
              </div>
              <ul className="space-y-2 mb-5 text-sm text-gray-600 dark:text-gray-400">
                {["Unlimited members & groups", "API access", "Custom branding", "Dedicated account manager", "24/7 priority support"].map(f => (
                  <li key={f} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Button full variant="secondary" onClick={() => navigate("/contact")}>Contact Sales</Button>
            </Card>
          </div>
          <div className="text-center mt-8">
            <button onClick={() => navigate("/pricing")} className="text-sm font-medium text-primary hover:underline">See full feature comparison →</button>
          </div>
        </div>
      </section>

      <section className="bg-primary py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to modernize your cooperative?</h2>
          <p className="text-emerald-100 mb-8">Join thousands of cooperatives already saving smarter with Kolo.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate("/register/cooperative")} className="dark:bg-white dark:text-gray-900">
              <Building2 className="w-5 h-5" />Create Cooperative Account
            </Button>
            <Button size="lg" onClick={() => navigate("/register")} className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
              Join as Member
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 dark:bg-black py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="mb-4">
                <Logo theme="light" size="sm" />
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">Digitizing traditional cooperative savings for modern Africa.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-4">Product</p>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/how-it-works")} className="text-sm text-gray-400 hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => navigate("/pricing")} className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate("/security")} className="text-sm text-gray-400 hover:text-white transition-colors">Security</button></li>
                <li><button onClick={() => navigate("/about")} className="text-sm text-gray-400 hover:text-white transition-colors">About</button></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-4">Support</p>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/help")} className="text-sm text-gray-400 hover:text-white transition-colors">Help Center</button></li>
                <li><button onClick={() => navigate("/contact")} className="text-sm text-gray-400 hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-4">Legal</p>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/terms")} className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</button></li>
                <li><button onClick={() => navigate("/privacy")} className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} KOLO Limited. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-800/50 px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3 text-emerald-400" />GDPR Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-800/50 px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3 text-emerald-400" />NDPR Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-800/50 px-3 py-1.5 rounded-full">
                <Banknote className="w-3 h-3 text-emerald-400" />PCI-DSS Secure
              </span>
            </div>
            <p className="text-sm text-gray-500">Powered by Nomba Payment Infrastructure</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
