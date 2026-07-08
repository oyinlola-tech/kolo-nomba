import { useState } from "react";
import { ShieldCheck, ChevronLeft, ChevronRight, X } from "lucide-react";

interface Shot {
  img: string;
  label: string;
  desc: string;
}

interface Tab {
  id: string;
  label: string;
  color: string;
  screenshots: Shot[];
}

const TABS: Tab[] = [
  {
    id: "sa", label: "Platform Admin", color: "violet",
    screenshots: [
      { img: "sa-dashboard", label: "Dashboard Overview", desc: "Platform metrics, revenue trends, recent activity" },
      { img: "sa-users", label: "User Management", desc: "View, search, and manage all platform users" },
      { img: "sa-groups", label: "Group Oversight", desc: "Monitor all cooperatives and their performance" },
      { img: "sa-transactions", label: "Transaction Monitoring", desc: "Full transaction history with status filters" },
      { img: "sa-withdrawals", label: "Withdrawal Requests", desc: "Approve or reject pending withdrawals" },
      { img: "sa-verification", label: "KYC Verification", desc: "Review and approve identity documents" },
    ],
  },
  {
    id: "ga", label: "Group Admin", color: "blue",
    screenshots: [
      { img: "ga-dashboard", label: "Group Dashboard", desc: "Savings trends, cycle progress, recent payments" },
      { img: "ga-members", label: "Member Management", desc: "Manage member roster and send invitations" },
      { img: "ga-contributions", label: "Contribution Tracking", desc: "Track paid, pending, and late contributions" },
      { img: "ga-payouts", label: "Payout Management", desc: "Request and manage group payouts" },
      { img: "ga-reports", label: "Reports & Analytics", desc: "Visual charts for savings and contributions" },
      { img: "ga-settings", label: "Group Settings", desc: "Configure group profile and contribution rules" },
    ],
  },
  {
    id: "member", label: "Member", color: "emerald",
    screenshots: [
      { img: "member-home", label: "Personal Dashboard", desc: "Contribution summary, payment health, quick actions" },
      { img: "member-groups", label: "My Groups", desc: "View joined groups and browse available ones" },
      { img: "member-history", label: "Payment History", desc: "Timeline of all contributions with receipt download" },
      { img: "member-notifications", label: "Notifications", desc: "In-app alerts for payments, reminders, and updates" },
      { img: "member-profile", label: "Profile & Settings", desc: "Manage personal info and virtual account" },
    ],
  },
];

export function DashboardGallery() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [slideIdx, setSlideIdx] = useState(0);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const tab = TABS.find((t) => t.id === activeTab) ?? TABS[0];
  const shots = tab.screenshots;
  const current = shots[slideIdx];

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Dashboard Previews</h2>
          <p className="text-xs text-gray-500 dark:text-muted-foreground">See what each role looks like before you log in</p>
        </div>
      </div>

      <div className="flex gap-1 mb-5 bg-gray-100 dark:bg-muted rounded-xl p-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setSlideIdx(0); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === t.id
                ? "bg-white dark:bg-card text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-white"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl overflow-hidden">
        <div className="relative">
          <button onClick={() => setPreviewImg(`/demo-screenshots/${current.img}.png`)} className="w-full block text-left cursor-pointer">
            <img
              src={`/demo-screenshots/${current.img}.png`}
              alt={current.label}
              className="w-full object-cover border-b border-gray-100 dark:border-border"
              style={{ maxHeight: 420 }}
            />
          </button>
          {shots.length > 1 && (
            <>
              <button onClick={() => setSlideIdx((i) => Math.max(0, i - 1))} disabled={slideIdx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center shadow hover:bg-white dark:hover:bg-black/70 disabled:opacity-30 transition-all">
                <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-white" />
              </button>
              <button onClick={() => setSlideIdx((i) => Math.min(shots.length - 1, i + 1))} disabled={slideIdx === shots.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center shadow hover:bg-white dark:hover:bg-black/70 disabled:opacity-30 transition-all">
                <ChevronRight className="w-4 h-4 text-gray-700 dark:text-white" />
              </button>
            </>
          )}
        </div>
        <div className="p-4 lg:p-5 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{current.label}</p>
            <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{current.desc}</p>
          </div>
          <div className="flex gap-1.5">
            {shots.map((_, i) => (
              <button key={i} onClick={() => setSlideIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === slideIdx ? "bg-primary w-4" : "bg-gray-300 dark:bg-gray-600"
                }`} />
            ))}
          </div>
        </div>
      </div>

      {previewImg && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewImg(null)}
          onKeyDown={(e) => e.key === "Escape" && setPreviewImg(null)}
          tabIndex={0}>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewImg(null)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white dark:bg-card shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <img src={previewImg} alt="Preview"
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain bg-white" />
          </div>
        </div>
      )}
    </div>
  );
}
