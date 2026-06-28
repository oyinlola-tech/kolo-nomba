import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "../../../components/shared/Button";
import { Card } from "../../../components/shared/Card";
import { Input } from "../../../components/shared/Input";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { Logo } from "../../../components/shared/Logo";
import { LandingFooter } from "../../../components/shared/LandingFooter";
import { apiClient } from "../../../api/client";

export function ContactPage() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", subject: "", message: "" });
  const [error, setError] = useState("");

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

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Contact Us</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">Have a question or need help? We&apos;d love to hear from you.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="lg:col-span-2">
            {sent ? (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message sent!</h2>
                <p className="text-gray-500 dark:text-muted-foreground mb-6">We&apos;ll get back to you within 24 hours.</p>
                <Button variant="secondary" onClick={() => setSent(false)}>Send another message</Button>
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="font-bold text-gray-900 dark:text-white mb-5">Send us a message</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="First Name" placeholder="Your first name" value={form.firstName} onChange={v => setForm(f => ({ ...f, firstName: v }))} />
                    <Input label="Last Name" placeholder="Your last name" value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} />
                  </div>
                  <Input label="Email" placeholder="you@example.com" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
                  <Input label="Subject" placeholder="How can we help?" value={form.subject} onChange={v => setForm(f => ({ ...f, subject: v }))} />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                    <textarea rows={4} placeholder="Tell us more..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-border rounded-xl text-sm bg-white dark:bg-input-background text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <Button full onClick={async () => {
                    setError("");
                    setSending(true);
                    try {
                      await apiClient.post("/contact", form);
                      setSent(true);
                    } catch {
                      setError("Failed to send message. Please try again.");
                    } finally {
                      setSending(false);
                    }
                  }} disabled={sending}>
                    {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </Card>
            )}
          </div>
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: "hello@kolo.africa" },
              { icon: Phone, label: "Phone", value: "+234 800 KOLO" },
              { icon: MapPin, label: "Location", value: "Lagos, Nigeria" },
              { icon: MessageSquare, label: "Support Hours", value: "Mon-Fri, 8AM-6PM WAT" },
            ].map(({ icon: I, label, value }) => (
              <Card key={label} className="p-4">
                <div className="flex items-center gap-3">
                  <I className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">{label}</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
