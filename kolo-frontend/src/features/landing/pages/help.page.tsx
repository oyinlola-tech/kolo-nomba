import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Mail } from "lucide-react";
import { Button } from "../../../components/shared/Button";
import { Card } from "../../../components/shared/Card";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { Logo } from "../../../components/shared/Logo";
import { LandingFooter } from "../../../components/shared/LandingFooter";

const guides = [
  { title: "Getting Started as a Group Admin", desc: "Learn how to create and manage your cooperative on Kolo.", category: "Admin" },
  { title: "How to Join a Savings Group", desc: "Step-by-step guide to finding and joining a cooperative.", category: "Member" },
  { title: "Making Your First Contribution", desc: "How to pay via bank transfer, USSD, or card.", category: "Member" },
  { title: "Managing Member Invites", desc: "Invite members to your group and track their onboarding.", category: "Admin" },
  { title: "Understanding Payouts", desc: "How payout rotation works and how to request one.", category: "Admin" },
  { title: "Viewing Your Transaction History", desc: "Access and download your contribution receipts.", category: "Member" },
];

const faqs = [
  { q: "How do I create a savings group?", a: "Click 'Create Cooperative' on the homepage. Fill in your group details, contribution rules, and member list. Your group will be live immediately." },
  { q: "How do members pay contributions?", a: "Each member gets a unique virtual account number. They can transfer, use USSD, or pay via card. Payments are matched automatically." },
  { q: "When can I request a payout?", a: "Payouts are available according to your group's rotation schedule. Group admins can initiate payouts from the dashboard." },
  { q: "Is my money safe?", a: "Yes. Funds are held in licensed financial institutions. Every transaction is encrypted and logged. We never commingle funds." },
  { q: "How do I reset my password?", a: "Click 'Forgot Password' on the login page. Enter your email and follow the reset link sent to your inbox." },
  { q: "Can I leave a group?", a: "Yes. Members can leave groups at any time. Accumulated savings are paid out according to group rules." },
];

export function HelpPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

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
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-primary to-emerald-900 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">How can we help?</h1>
          <p className="text-emerald-100 mb-8">Search our help center or browse guides below.</p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input placeholder="Search for guides, FAQs, topics..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-emerald-200/70 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm" />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6">Guides & Articles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.filter(g => !search || g.title.toLowerCase().includes(search.toLowerCase())).map(({ title, desc, category }) => (
            <Card key={title} className="p-5 hover:shadow-md transition-shadow cursor-pointer">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${category === "Admin" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"}`}>{category}</span>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mt-2 mb-1">{title}</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-card/50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details key={q} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl overflow-hidden">
                <summary className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2">{q}</summary>
                <div className="px-5 pb-4 text-sm text-gray-500 dark:text-muted-foreground">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">Still need help?</h2>
        <p className="text-gray-500 dark:text-muted-foreground mb-6">Our support team is available Monday-Friday, 8AM-6PM WAT.</p>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate("/contact")}><Mail className="w-4 h-4" />Email Us</Button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
