import { useNavigate } from "react-router";
import { Users, Shield, Globe, Target, Heart } from "lucide-react";
import { Button } from "../../../components/shared/Button";
import { Card } from "../../../components/shared/Card";
import { Avatar } from "../../../components/shared/Avatar";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { Logo } from "../../../components/shared/Logo";
import { LandingFooter } from "../../../components/shared/LandingFooter";

export function AboutPage() {
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

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-primary tracking-widest uppercase">About Kolo</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mt-4 mb-6">Digitizing cooperative savings for Africa</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Kolo is modernizing traditional Ajo and Esusu savings systems by bringing transparency, security, and automation to group savings.</p>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-card/50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">To empower every African community with the financial infrastructure they need to save collectively, build wealth, and achieve shared goals — without the friction of manual systems.</p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">We believe that cooperative savings is one of the most powerful tools for financial inclusion. By digitizing it, we make it more accessible, transparent, and trustworthy.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: "Communities", value: "15,000+" },
                { icon: Shield, label: "Members Protected", value: "2.4M+" },
                { icon: Globe, label: "Countries", value: "5" },
                { icon: Target, label: "Processed", value: "₦42B+" },
              ].map(({ icon: I, label, value }) => (
                <Card key={label} className="p-5 text-center">
                  <I className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground">{label}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-12">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Heart, title: "Trust First", desc: "Every feature we build starts with the question: does this build trust? We prioritize transparency in everything we do." },
            { icon: Users, title: "Community Powered", desc: "We believe in the strength of communities. Our platform is designed to amplify collective financial power, not replace it." },
            { icon: Shield, title: "Security Always", desc: "Handling people's money is a responsibility we take seriously. Every decision is made with security as the foundation." },
          ].map(({ icon: I, title, desc }) => (
            <Card key={title} className="p-6">
              <I className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-4" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground leading-relaxed">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-card/50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Our Team</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto">A passionate team building the financial infrastructure for African communities.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { name: "Emeka Chibuike", role: "CEO & Co-Founder", bio: "Former fintech executive passionate about financial inclusion." },
              { name: "Adaobi Okonkwo", role: "CTO & Co-Founder", bio: "Software engineer with 10+ years building payment systems." },
              { name: "Chioma Eze", role: "Head of Product", bio: "Product leader focused on creating intuitive financial experiences." },
            ].map(({ name, role, bio }) => (
              <Card key={name} className="p-6 text-center">
                <Avatar name={name} />
                <h3 className="font-bold text-gray-900 dark:text-white mt-3">{name}</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{role}</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-2">{bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Join us in modernizing cooperative savings</h2>
          <p className="text-emerald-100 mb-8">Start your journey with Kolo today.</p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/register")}>Get Started Free</Button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
