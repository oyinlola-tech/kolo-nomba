import type { ReactNode, ElementType } from "react";
import { ShieldCheck, Building2, Zap } from "lucide-react";
import { ThemeToggle } from "../shared/ThemeToggle";
import { Logo } from "../shared/Logo";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  icon?: ElementType;
  showBack?: boolean;
  onBack?: () => void;
}

export function AuthLayout({ children, title, subtitle, icon: Icon, showBack, onBack }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — redesigned */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0d2b1f] items-end p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#065f46] via-[#0d2b1f] to-black opacity-90" />
        {/* Abstract savings-growth pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute w-full h-full opacity-[0.06]" viewBox="0 0 800 900" fill="none" preserveAspectRatio="xMidYMid slice">
            {/* Circular cooperative rings */}
            <circle cx="600" cy="200" r="280" stroke="white" strokeWidth="1" />
            <circle cx="600" cy="200" r="200" stroke="white" strokeWidth="0.5" />
            <circle cx="600" cy="200" r="120" stroke="white" strokeWidth="0.3" />
            {/* Growth bars ascending */}
            <rect x="80" y="500" width="40" height="200" rx="6" fill="white" />
            <rect x="150" y="420" width="40" height="280" rx="6" fill="white" />
            <rect x="220" y="340" width="40" height="360" rx="6" fill="white" />
            <rect x="290" y="260" width="40" height="440" rx="6" fill="white" />
            <rect x="360" y="180" width="40" height="520" rx="6" fill="white" />
            {/* Connection dots */}
            <circle cx="100" cy="480" r="4" fill="white" />
            <circle cx="170" cy="400" r="4" fill="white" />
            <circle cx="240" cy="320" r="4" fill="white" />
            <circle cx="310" cy="240" r="4" fill="white" />
            <circle cx="380" cy="160" r="4" fill="white" />
            {/* Subtle connecting lines between dots */}
            <path d="M100 480 L170 400 L240 320 L310 240 L380 160" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="mb-8">
            <Logo theme="light" />
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
            Collective prosperity, simplified.
          </h2>
          <p className="text-emerald-100/70 text-sm leading-relaxed mb-8 max-w-sm">
            Join thousands of individuals and cooperatives building secure financial futures with modern banking agility.
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              { icon: ShieldCheck, label: "Bank-level Security" },
              { icon: Building2, label: "Cooperative Focused" },
              { icon: Zap, label: "Instant Settlements" },
            ].map(({ icon: I, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-emerald-100/60">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <I className="w-3 h-3 text-emerald-400" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-white dark:bg-background min-h-screen">
        {/* mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 pt-10 pb-5">
          <div className="flex items-center gap-2">
            {showBack && onBack && (
              <button onClick={onBack} className="p-1 -ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M19 12H5m7-7l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
            <Logo size="sm" />
          </div>
          <ThemeToggle />
        </div>
        <div className="hidden lg:flex justify-end px-10 pt-6">
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-start justify-center px-5 pb-8 pt-6 lg:items-center lg:pt-0">
          <div className="w-full max-w-md">
            {showBack && onBack && (
              <button onClick={onBack} className="hidden lg:flex items-center gap-1.5 text-sm text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-white mb-6 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M19 12H5m7-7l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back
              </button>
            )}
            {Icon && (
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-muted-foreground mb-7">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
