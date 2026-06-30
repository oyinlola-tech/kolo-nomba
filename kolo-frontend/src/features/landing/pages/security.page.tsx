import { useNavigate } from "react-router";
import { Lock, ShieldCheck, Eye, Database, Key, Server, UserCheck, FileCheck, ArrowRight } from "lucide-react";
import { Button } from "../../../components/shared/Button";
import { Card } from "../../../components/shared/Card";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { Logo } from "../../../components/shared/Logo";
import { LandingFooter } from "../../../components/shared/LandingFooter";

const sections = [
  { icon: Lock, title: "Encryption", desc: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. No exceptions." },
  { icon: ShieldCheck, title: "Authentication", desc: "Multi-factor authentication is available for all accounts. Role-based access control ensures data privacy." },
  { icon: Eye, title: "Monitoring", desc: "Our systems are monitored 24/7 for suspicious activity. Automated alerts flag anomalies in real-time." },
  { icon: Database, title: "Data Protection", desc: "Member data is segregated and access is logged. We follow strict data minimization principles." },
  { icon: Server, title: "Infrastructure", desc: "Hosted on secure cloud infrastructure with redundant backups. Disaster recovery tested regularly." },
  { icon: UserCheck, title: "Access Control", desc: "Granular permissions ensure users only access what they need. All actions are recorded with audit trails." },
  { icon: FileCheck, title: "Compliance", desc: "We maintain SOC 2 compliance frameworks and undergo regular third-party security audits." },
  { icon: Key, title: "API Security", desc: "All API requests are authenticated and rate-limited. Sensitive operations require additional verification." },
];

export function SecurityPage() {
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
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-primary tracking-widest uppercase">Security</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mt-4 mb-6">Security is our foundation</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">We handle financial data with the highest security standards. Every layer of Kolo is built to protect member funds, personal information, and transaction records.</p>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-card/50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sections.map(({ icon: I, title, desc }) => (
              <Card key={title} className="p-5">
                <I className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Security practices</h2>
        <div className="space-y-6">
          {[
            { title: "Fund Security", items: ["Member funds are held in licensed financial institutions", "Funds are segregated from operating accounts", "All disbursements require multi-party approval", "Real-time reconciliation detects discrepancies instantly"] },
            { title: "Data Privacy", items: ["Personal data is encrypted and access-controlled", "We never share member data with third parties", "Data retention follows regulatory requirements", "Members can request data deletion at any time"] },
            { title: "Platform Security", items: ["Regular penetration testing by independent firms", "Vulnerability disclosure program for researchers", "Automated threat detection and response", "Immutable audit logs for all administrative actions"] },
          ].map(({ title, items }) => (
            <div key={title}>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {items.map(item => (
                  <div key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />{item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Trusted by 15,000+ cooperatives</h2>
          <p className="text-emerald-100 mb-8">Start your secure savings journey today.</p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/register")}>Get Started Free <ArrowRight className="w-4 h-4" /></Button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
