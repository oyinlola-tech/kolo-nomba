import { useNavigate } from "react-router";
import { Button } from "../../../components/shared/Button";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { Logo } from "../../../components/shared/Logo";
import { LandingFooter } from "../../../components/shared/LandingFooter";

export function TermsPage() {
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
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-gray-500 dark:text-muted-foreground mb-8">Last updated: June 2026</p>

        <div className="space-y-8 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Kolo&apos;s platform, you agree to be bound by these Terms &amp; Conditions. If you do not agree, do not use the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Platform Description</h2>
            <p>Kolo provides a digital platform for managing cooperative savings groups, including member management, contribution tracking, payment collection, and payout disbursement. The platform facilitates financial transactions through licensed payment infrastructure partners.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the platform only for lawful purposes</li>
              <li>Not engage in fraudulent or deceptive activities</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Notify Kolo immediately of any unauthorized account access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Group Admin Responsibilities</h2>
            <p>Group admins are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Managing member invitations and access</li>
              <li>Setting contribution rules and schedules</li>
              <li>Approving payouts and disbursements</li>
              <li>Communicating group policies to members</li>
              <li>Ensuring compliance with cooperative rules</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Member Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Make contributions according to group schedule</li>
              <li>Use assigned payment methods correctly</li>
              <li>Maintain sufficient funds for contributions</li>
              <li>Report payment issues promptly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Payments &amp; Fees</h2>
            <p>Kolo charges transaction fees as disclosed on our pricing page. Fees are deducted from each successful transaction. Kolo does not hold or manage member funds directly; all funds are processed through licensed payment infrastructure partners.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Service Availability</h2>
            <p>We strive to maintain 99.9% platform uptime. However, we do not guarantee uninterrupted service. Scheduled maintenance and unforeseen technical issues may cause temporary interruptions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Limitation of Liability</h2>
            <p>Kolo shall not be liable for indirect, incidental, or consequential damages arising from platform use. Our total liability is limited to fees paid in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Termination</h2>
            <p>Kolo reserves the right to suspend or terminate accounts that violate these terms. Users may terminate their account at any time by contacting support.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">10. Changes to Terms</h2>
            <p>We may update these terms from time to time. Users will be notified of material changes via email or platform notification. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">11. Governing Law</h2>
            <p>These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved through arbitration in Lagos, Nigeria.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">12. Contact</h2>
            <p>For questions about these terms, contact us at <span className="font-medium text-gray-900 dark:text-white">legal@kolo.africa</span>.</p>
          </section>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
