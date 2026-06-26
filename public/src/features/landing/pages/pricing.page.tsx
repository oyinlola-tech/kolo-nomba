import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, HelpCircle, Zap, TrendingUp, Award } from "lucide-react";
import { Button } from "../../../components/shared/Button";
import { Card } from "../../../components/shared/Card";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { Logo } from "../../../components/shared/Logo";
import { LandingFooter } from "../../../components/shared/LandingFooter";

const plans = [
  {
    name: "Free",
    tagline: "For small community groups",
    price: "₦0",
    period: "forever",
    icon: Award,
    features: [
      "Up to 15 members per group",
      "Basic contribution tracking",
      "Manual payment recording",
      "Email notifications",
      "Basic reports",
      "1 group",
    ],
    cta: "Get Started Free",
    href: "/register",
    popular: false,
  },
  {
    name: "Growth",
    tagline: "For serious cooperative groups",
    price: "₦9,500",
    period: "/month",
    icon: TrendingUp,
    features: [
      "Up to 100 members per group",
      "Automated contribution tracking",
      "Virtual accounts via Nomba",
      "Email & SMS notifications",
      "Advanced analytics & reports",
      "Automated payment reminders",
      "Priority support",
      "Up to 3 groups",
    ],
    cta: "Start Free Trial",
    href: "/register/cooperative",
    popular: true,
  },
  {
    name: "Business",
    tagline: "For organizations and associations",
    price: "Custom",
    period: "",
    icon: Zap,
    features: [
      "Unlimited members per group",
      "Unlimited groups",
      "API access for custom integrations",
      "Dedicated account manager",
      "Custom branding / white label",
      "Advanced compliance tools",
      "Custom webhook integrations",
      "24/7 priority support",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
  },
];

const fees = [
  { label: "Transaction Processing", rate: "1% per contribution", desc: "Charged on each successful member contribution. Covers payment infrastructure costs." },
  { label: "Withdrawal / Payout Fee", rate: "₦100 flat", desc: "Charged when a group admin requests a payout. Covers transfer and settlement costs." },
  { label: "Subscription (Growth)", rate: "₦9,500/month", desc: "Optional upgrade for advanced features. Free plan has no subscription fee." },
  { label: "Enterprise Services", rate: "Custom", desc: "For organizations needing white-label solutions, dedicated infrastructure, or custom development." },
];

const faqs = [
  { q: "Is the Free plan really free?", a: "Yes. The Free plan has no subscription fee. You only pay the per-transaction processing fee (1%) when members contribute." },
  { q: "What payment methods can members use?", a: "Members can pay via bank transfer, USSD, mobile money, or card. Virtual accounts are provided for each member on Growth and Business plans." },
  { q: "How does Kolo make money?", a: "Kolo earns revenue through transaction processing fees (1% per contribution), subscription fees (Growth plan), payout fees, and enterprise services. See our How It Works page for details." },
  { q: "Can I switch plans?", a: "Yes. You can upgrade from Free to Growth at any time. Contact sales for Business plan migration." },
  { q: "Are there setup fees?", a: "No. There are zero setup or onboarding fees for any plan." },
  { q: "How do payouts work?", a: "Group admins request a payout. Funds are disbursed to member bank accounts within 24 hours. A flat ₦100 fee applies per payout." },
];

export function PricingPage() {
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

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center">
        <span className="text-xs font-bold text-primary tracking-widest uppercase">Pricing</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mt-4 mb-4">Simple, transparent pricing</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Start free. Upgrade as you grow. Only pay transaction fees when your members contribute.</p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(p => (
            <Card key={p.name} className={`p-6 relative flex flex-col ${p.popular ? "border-primary/40 bg-emerald-50/30 dark:bg-emerald-900/5 ring-1 ring-primary/20" : ""}`}>
              {p.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
              <p.icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{p.name}</h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-4">{p.tagline}</p>
              <div className="mb-4">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{p.price}</span>
                <span className="text-sm text-gray-500 dark:text-muted-foreground ml-1">{p.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button full onClick={() => navigate(p.href)} variant={p.popular ? "primary" : "secondary"}>{p.cta}</Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-card/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-3">Fee breakdown</h2>
          <p className="text-sm text-gray-500 dark:text-muted-foreground text-center mb-10">You only pay when your group is active. No hidden charges.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {fees.map(f => (
              <Card key={f.label} className="p-5">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{f.label}</p>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0 ml-2">{f.rate}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-background py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details key={q} className="bg-gray-50 dark:bg-card border border-gray-100 dark:border-border rounded-xl overflow-hidden">
                <summary className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-white dark:hover:bg-white/5">{q}</summary>
                <div className="px-5 pb-4 text-sm text-gray-500 dark:text-muted-foreground">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Still have questions?</h2>
          <p className="text-emerald-100 mb-8">Our team is happy to help you find the right plan.</p>
          <div className="flex justify-center gap-3">
            <Button size="lg" variant="secondary" onClick={() => navigate("/how-it-works")}>How It Works <ArrowRight className="w-4 h-4" /></Button>
            <Button size="lg" onClick={() => navigate("/contact")} className="bg-white/10 hover:bg-white/20 text-white border border-white/20">Contact Us</Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
