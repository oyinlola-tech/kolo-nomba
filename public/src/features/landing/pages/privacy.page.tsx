import { useNavigate } from "react-router";
import { Button } from "../../../components/shared/Button";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { Logo } from "../../../components/shared/Logo";
import { LandingFooter } from "../../../components/shared/LandingFooter";

export function PrivacyPage() {
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

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-muted-foreground mb-8">Last updated: June 2026</p>

        <div className="space-y-8 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
            <p className="mb-2">We collect information necessary to provide our services:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><span className="font-medium text-gray-900 dark:text-white">Account Information:</span> Name, email address, phone number, and password</li>
              <li><span className="font-medium text-gray-900 dark:text-white">Profile Information:</span> Profile photo, bank account details for payouts</li>
              <li><span className="font-medium text-gray-900 dark:text-white">Transaction Data:</span> Contribution amounts, payment dates, group memberships</li>
              <li><span className="font-medium text-gray-900 dark:text-white">Device Information:</span> IP address, browser type, device identifiers</li>
              <li><span className="font-medium text-gray-900 dark:text-white">Usage Data:</span> Pages visited, features used, session duration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Provide, maintain, and improve our platform</li>
              <li>Process transactions and send payment confirmations</li>
              <li>Send notifications about contributions, payouts, and group activity</li>
              <li>Detect and prevent fraudulent or unauthorized activity</li>
              <li>Comply with legal and regulatory obligations</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Data Sharing</h2>
            <p className="mb-2">We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><span className="font-medium text-gray-900 dark:text-white">Payment Partners:</span> To process transactions (e.g., Nomba)</li>
              <li><span className="font-medium text-gray-900 dark:text-white">Service Providers:</span> For cloud hosting, analytics, and customer support</li>
              <li><span className="font-medium text-gray-900 dark:text-white">Legal Authorities:</span> When required by law or to protect rights</li>
              <li><span className="font-medium text-gray-900 dark:text-white">Group Members:</span> Limited information visible within your cooperative group</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your data, including encryption in transit and at rest, access controls, regular security audits, and staff training on data protection.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Data Retention</h2>
            <p>We retain your information for as long as your account is active and as needed to provide services. Transaction records are retained as required by financial regulations. You can request data deletion at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Export your data</li>
              <li>Object to certain data processing</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Cookies</h2>
            <p>We use essential cookies for authentication and security. Analytics cookies help us improve the platform. You can control cookie preferences in your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Children&apos;s Privacy</h2>
            <p>Kolo is not intended for users under 18. We do not knowingly collect data from minors. If we discover a minor&apos;s data was collected, we will delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Changes to Policy</h2>
            <p>We may update this policy periodically. Material changes will be communicated via email or platform notification. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">10. Contact</h2>
            <p>For privacy-related inquiries, contact us at <span className="font-medium text-gray-900 dark:text-white">privacy@kolo.africa</span>.</p>
          </section>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
