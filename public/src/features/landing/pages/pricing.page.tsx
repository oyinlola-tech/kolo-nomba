import { useNavigate } from "react-router";
import { Check, X, ArrowRight, TrendingUp, Award, Building2 } from "lucide-react";
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
    highlight: false,
    cta: "Get Started Free",
    href: "/register",
  },
  {
    name: "Growth",
    tagline: "For serious cooperative groups",
    price: "₦9,500",
    period: "/month",
    icon: TrendingUp,
    highlight: true,
    cta: "Start Free Trial",
    href: "/register/cooperative",
  },
  {
    name: "Business",
    tagline: "For organizations and associations",
    price: "Custom",
    period: "",
    icon: Building2,
    highlight: false,
    cta: "Contact Sales",
    href: "/contact",
  },
];

type FeatureRow = {
  label: string;
  free: boolean | string;
  growth: boolean | string;
  business: boolean | string;
};

const featureGroups: { category: string; features: FeatureRow[] }[] = [
  {
    category: "Group Management",
    features: [
      { label: "Members per group", free: "15", growth: "100", business: "Unlimited" },
      { label: "Groups", free: "1", growth: "3", business: "Unlimited" },
      { label: "Contribution tracking", free: true, growth: true, business: true },
      { label: "Payout scheduling", free: true, growth: true, business: true },
      { label: "Member roles & permissions", free: false, growth: true, business: true },
      { label: "Custom contribution rules", free: false, growth: true, business: true },
    ],
  },
  {
    category: "Payments",
    features: [
      { label: "Manual payment recording", free: true, growth: true, business: true },
      { label: "Virtual accounts (Nomba)", free: false, growth: true, business: true },
      { label: "Automated payment matching", free: false, growth: true, business: true },
      { label: "Multiple payment channels", free: false, growth: true, business: true },
      { label: "Direct bank payouts", free: true, growth: true, business: true },
    ],
  },
  {
    category: "Notifications",
    features: [
      { label: "Email notifications", free: true, growth: true, business: true },
      { label: "SMS reminders", free: false, growth: true, business: true },
      { label: "Automated payment reminders", free: false, growth: true, business: true },
      { label: "Custom notification templates", free: false, growth: false, business: true },
    ],
  },
  {
    category: "Analytics & Reports",
    features: [
      { label: "Basic reports", free: true, growth: true, business: true },
      { label: "Advanced analytics dashboard", free: false, growth: true, business: true },
      { label: "Exportable financial reports", free: false, growth: true, business: true },
      { label: "Custom report builder", free: false, growth: false, business: true },
    ],
  },
  {
    category: "Support & Compliance",
    features: [
      { label: "Community support", free: true, growth: false, business: false },
      { label: "Priority email support", free: false, growth: true, business: true },
      { label: "24/7 phone support", free: false, growth: false, business: true },
      { label: "Dedicated account manager", free: false, growth: false, business: true },
      { label: "SLA guarantee", free: false, growth: false, business: true },
    ],
  },
  {
    category: "Integrations",
    features: [
      { label: "API access", free: false, growth: false, business: true },
      { label: "Custom webhook integrations", free: false, growth: false, business: true },
      { label: "White-label / custom branding", free: false, growth: false, business: true },
      { label: "Advanced compliance tools", free: false, growth: false, business: true },
    ],
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

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-auto" />;
  return <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>;
}

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

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(p => (
            <Card key={p.name} className={`p-6 relative flex flex-col ${p.highlight ? "border-primary/40 bg-emerald-50/30 dark:bg-emerald-900/5 ring-1 ring-primary/20" : ""}`}>
              {p.highlight && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
              <p.icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{p.name}</h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-4">{p.tagline}</p>
              <div className="mb-4">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{p.price}</span>
                <span className="text-sm text-gray-500 dark:text-muted-foreground ml-1">{p.period}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mb-4">+ 1% transaction fee per contribution</p>
              <Button full onClick={() => navigate(p.href)} variant={p.highlight ? "primary" : "secondary"}>{p.cta}</Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-card/50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-3">Compare plans</h2>
          <p className="text-sm text-gray-500 dark:text-muted-foreground text-center mb-10">See exactly what you get with each tier.</p>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase w-1/2">Feature</th>
                  {plans.map(p => (
                    <th key={p.name} className={`text-center py-3 px-4 text-xs font-semibold uppercase ${p.highlight ? "text-primary" : "text-gray-500 dark:text-muted-foreground"}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureGroups.map(group => (
                  <>
                    <tr key={group.category}>
                      <td colSpan={4} className="py-3 px-4 text-xs font-bold text-gray-900 dark:text-white bg-gray-100/50 dark:bg-muted/50 uppercase tracking-wider">
                        {group.category}
                      </td>
                    </tr>
                    {group.features.map(f => (
                      <tr key={f.label} className="border-b border-gray-100 dark:border-border hover:bg-gray-50/50 dark:hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{f.label}</td>
                        <td className="py-3 px-4 text-center"><FeatureValue value={f.free} /></td>
                        <td className="py-3 px-4 text-center"><FeatureValue value={f.growth} /></td>
                        <td className="py-3 px-4 text-center"><FeatureValue value={f.business} /></td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-6">
            {featureGroups.map(group => (
              <div key={group.category}>
                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">{group.category}</p>
                <div className="space-y-2">
                  {group.features.map(f => (
                    <div key={f.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl p-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{f.label}</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[10px] text-gray-400 mb-1">Free</p>
                          <FeatureValue value={f.free} />
                        </div>
                        <div>
                          <p className="text-[10px] text-primary mb-1">Growth</p>
                          <FeatureValue value={f.growth} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 mb-1">Business</p>
                          <FeatureValue value={f.business} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-background py-16">
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

      <section className="bg-gray-50 dark:bg-card/50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details key={q} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl overflow-hidden">
                <summary className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5">{q}</summary>
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
