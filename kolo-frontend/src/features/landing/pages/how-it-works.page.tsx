import { useNavigate } from "react-router";
import { useState } from "react";
import {
  UserPlus, Building2, Banknote, Check,
  TrendingUp, Percent, CreditCard, Shield, ArrowDownToLine,
  Award, Calculator, Minus, Plus,
} from "lucide-react";
import { Button } from "../../../components/shared/Button";
import { Card } from "../../../components/shared/Card";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { Logo } from "../../../components/shared/Logo";
import { LandingFooter } from "../../../components/shared/LandingFooter";

const steps = [
  { icon: UserPlus, title: "Member joins a group", desc: "Members receive an invite link or join via the platform. Their account is created and linked to the cooperative." },
  { icon: Banknote, title: "Member pays contribution", desc: "Using bank transfer, USSD, card, or mobile money. Each member gets a dedicated virtual account on Growth plans." },
  { icon: CreditCard, title: "Payment is processed", desc: "Kolo's payment infrastructure processes the transaction. A 1% processing fee is applied. The contribution is recorded instantly." },
  { icon: TrendingUp, title: "Group balance updates", desc: "The group's savings balance updates in real-time. All members can see the transaction in their dashboard." },
  { icon: ArrowDownToLine, title: "Payout is requested", desc: "The group admin initiates a payout according to the rotation schedule. A ₦100 flat fee applies per payout." },
  { icon: Shield, title: "Funds are disbursed", desc: "The payout amount is sent to the recipient's bank account. Full transaction records are maintained for audit." },
];

const revenueStreams = [
  {
    icon: Percent,
    title: "Transaction Processing Fees",
    rate: "1% per contribution",
    desc: "When a member contributes ₦50,000, Kolo charges 1% (₦500). This covers payment processing, infrastructure, and platform operations.",
    example: "100 members × ₦50,000 × 1% = ₦50,000 revenue per cycle",
  },
  {
    icon: TrendingUp,
    title: "Subscription Plans",
    rate: "₦9,500/month (Growth)",
    desc: "Groups that need advanced features upgrade to Growth plan. Includes virtual accounts, SMS notifications, advanced analytics, and priority support.",
    example: "500 groups × ₦9,500 = ₦4,750,000 monthly recurring revenue",
  },
  {
    icon: ArrowDownToLine,
    title: "Payout Service Fees",
    rate: "₦100 per payout",
    desc: "A fixed operational fee when groups disburse funds to members. Covers bank transfer costs and settlement processing.",
    example: "1,000 payouts × ₦100 = ₦100,000 revenue per month",
  },
  {
    icon: Award,
    title: "Enterprise Services",
    rate: "Custom pricing",
    desc: "Large organizations pay for white-label solutions, custom dashboards, API access, dedicated infrastructure, and compliance tools.",
    example: "Enterprise contracts from ₦500,000/month",
  },
];

function FeeCalculator() {
  const [members, setMembers] = useState(20);
  const [contribution, setContribution] = useState(50000);
  const [plan, setPlan] = useState<"free" | "growth">("free");

  const totalContributions = members * contribution;
  const processingFee = totalContributions * 0.01;
  const subscription = plan === "growth" ? 9500 : 0;
  const payoutFee = 100;
  const totalFees = processingFee + subscription + payoutFee;
  const netToMembers = totalContributions - totalFees;
  const effectiveRate = ((totalFees / totalContributions) * 100).toFixed(2);

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Calculator className="w-5 h-5 text-primary" />
          <span className="font-bold text-gray-900 dark:text-white">Calculate your costs</span>
        </div>

        <div className="space-y-4 mb-5">
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Members</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setMembers(m => Math.max(2, m - 1))} className="p-1.5 rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted transition-colors">
                <Minus className="w-4 h-4 text-gray-500" />
              </button>
              <span className="flex-1 text-center font-bold text-xl text-gray-900 dark:text-white">{members}</span>
              <button onClick={() => setMembers(m => m + 1)} className="p-1.5 rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted transition-colors">
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
              Contribution per member: ₦{contribution.toLocaleString()}
            </label>
            <input type="range" min={1000} max={500000} step={1000} value={contribution}
              onChange={e => setContribution(Number(e.target.value))}
              className="w-full accent-emerald-600" />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>₦1,000</span>
              <span>₦500,000</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Plan</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setPlan("free")}
                className={`p-2.5 rounded-xl text-sm font-medium border transition-all ${plan === "free" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "border-gray-200 dark:border-border text-gray-500 hover:border-gray-300"}`}>
                Free
              </button>
              <button onClick={() => setPlan("growth")}
                className={`p-2.5 rounded-xl text-sm font-medium border transition-all ${plan === "growth" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "border-gray-200 dark:border-border text-gray-500 hover:border-gray-300"}`}>
                Growth (₦9,500/mo)
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-border pt-4 space-y-2">
          {[
            ["Total contributions", `₦${totalContributions.toLocaleString()}`],
            ["Processing fee (1%)", `−₦${processingFee.toLocaleString()}`],
            ["Subscription", plan === "free" ? "₦0" : `−₦${subscription.toLocaleString()}`],
            ["Payout fee", `−₦${payoutFee}`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{label}</span>
              <span className="font-medium text-gray-900 dark:text-white">{value}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 dark:border-border pt-2 flex justify-between text-sm font-bold">
            <span className="text-gray-900 dark:text-white">Net to members</span>
            <span className="text-emerald-600 dark:text-emerald-400">₦{netToMembers.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-4 bg-gray-50 dark:bg-muted rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Effective fee rate</p>
          <p className="text-lg font-extrabold text-gray-900 dark:text-white">{effectiveRate}%</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Kolo earns ₦{totalFees.toLocaleString()} from this group per cycle</p>
        </div>
      </div>
    </div>
  );
}

export function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-background/90 backdrop-blur-md border-b border-gray-100 dark:border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")}>
              <Logo />
            </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign In</Button>
            <Button size="sm" onClick={() => navigate("/register")}>Get Started</Button>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <span className="text-xs font-bold text-primary tracking-widest uppercase">How It Works</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mt-4 mb-6">How Kolo works</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">From member contribution to group payout — and how Kolo sustains the platform.</p>
      </section>

      <section className="bg-gray-50 dark:bg-card/50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-4">The payment flow</h2>
          <p className="text-sm text-gray-500 dark:text-muted-foreground text-center mb-10 max-w-lg mx-auto">Every contribution follows this path from member payment to group balance update.</p>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-border" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <div key={s.title} className="relative">
                  <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <s.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-600">STEP {i + 1}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{s.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-4">How Kolo makes money</h2>
        <p className="text-sm text-gray-500 dark:text-muted-foreground text-center mb-10 max-w-lg mx-auto">Kolo is a sustainable business. We earn revenue only when the platform delivers value.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {revenueStreams.map(r => (
            <Card key={r.title} className="p-6 border-l-4 border-l-emerald-500">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <r.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{r.title}</h3>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{r.rate}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-2">{r.desc}</p>
              <div className="bg-gray-50 dark:bg-muted rounded-lg p-3">
                <p className="text-xs font-medium text-gray-900 dark:text-white flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Example</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{r.example}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-card/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: UserPlus, title: "For Members",
                items: ["Join a savings group via invite link", "Pay contributions via bank, USSD, or card", "Track your savings in real-time", "Receive payment reminders", "Download contribution receipts"],
              },
              {
                icon: Building2, title: "For Group Admins",
                items: ["Create and configure your cooperative", "Invite members and assign roles", "Track contributions and payment status", "Approve and schedule payouts", "Generate financial reports"],
              },
              {
                icon: Shield, title: "For Kolo Platform",
                items: ["Process payments through secure infrastructure", "Apply transaction fee (1%) on each contribution", "Collect subscription fees (Growth plans)", "Charge payout service fee (₦100 flat)", "Provide enterprise services for large organizations"],
              },
            ].map(({ icon: I, title, items }) => (
              <Card key={title} className="p-6">
                <I className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                <ul className="space-y-2">
                  {items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-2">Fee calculator</h2>
        <p className="text-sm text-gray-500 dark:text-muted-foreground text-center mb-8">Estimate what your group will pay to Kolo per cycle.</p>
        <FeeCalculator />
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-4">Example: What a group pays</h2>
        <p className="text-sm text-gray-500 dark:text-muted-foreground text-center mb-8">A typical cooperative with 20 members on the Free plan.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase">Item</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase">Calculation</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-border">
              {[
                ["Monthly contributions (20 × ₦50,000)", "", "₦1,000,000"],
                ["Kolo processing fee (1%)", "₦1,000,000 × 1%", "₦10,000"],
                ["Subscription (Free plan)", "₦0", "₦0"],
                ["Payout fee (1 per cycle)", "₦100 flat", "₦100"],
                ["Total Kolo revenue per cycle", "", "₦10,100"],
                ["Remaining for members after payout", "₦1,000,000 − ₦10,100", "₦989,900"],
              ].map(([item, calc, amount], i) => (
                <tr key={i} className={i === 4 ? "bg-emerald-50 dark:bg-emerald-900/10" : i === 5 ? "font-bold" : ""}>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{item}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{calc}</td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">Kolo earns ₦10,100 from this group per cycle — 1.01% of total contributions.</p>
      </section>

      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to get started?</h2>
          <p className="text-emerald-100 mb-8">Create your cooperative or join as a member. Free plan, no credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate("/register/cooperative")}>Create Cooperative</Button>
            <Button size="lg" onClick={() => navigate("/register")} className="bg-white/10 hover:bg-white/20 text-white border border-white/20">Join as Member</Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
