import { useNavigate, useLocation, Outlet } from "react-router";
import { Home, Receipt, Building2, User, Bell, Search, ChevronDown } from "lucide-react";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { Logo } from "../../../components/shared/Logo";
import { NotificationBell } from "../../../components/layout/NotificationBell";
import { Avatar } from "../../../components/shared/Avatar";
import { useAuth } from "../../../hooks/use-auth";
import { useRealtimeNotifications } from "../../../hooks/use-realtime";
import { useState } from "react";

type Screen = "home" | "groups" | "history" | "notifications" | "profile";

const navItems: { id: Screen; icon: typeof Home; label: string }[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "groups", icon: Building2, label: "Groups" },
  { id: "history", icon: Receipt, label: "History" },
  { id: "notifications", icon: Bell, label: "Alerts" },
  { id: "profile", icon: User, label: "Profile" },
];

export function MemberApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  useRealtimeNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userName = user ? `${user.firstName} ${user.lastName}` : "Member";
  const segments = location.pathname.replace(/^\/+/, "").split("/");
  const last = segments[segments.length - 1];
  const knownScreens = ["home", "groups", "history", "notifications", "profile"];
  const activeScreen: Screen = (last === "member" || segments.length === 1 || !knownScreens.includes(last) ? "home" : last) as Screen;

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-background flex flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-white dark:bg-card border-r border-gray-100 dark:border-border flex-shrink-0">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100 dark:border-border flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl flex items-center justify-center shadow-sm">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Kolo Member</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Savings Dashboard</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map(({ id, icon: I, label }) => (
            <button key={id} onClick={() => { navigate(id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeScreen === id
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-muted/50 hover:text-gray-800 dark:hover:text-gray-200"
              }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                activeScreen === id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-transparent text-inherit"
              }`}>
                <I className="w-4 h-4" />
              </div>
              {label}
              {id === "notifications" && (
                <span className="ml-auto w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-card animate-pulse" />
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-gray-100 dark:border-border p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate("profile")}>
            <Avatar name={userName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
              <p className="text-[10px] text-gray-400 dark:text-muted-foreground">{user?.email || ""}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-gray-100 dark:border-border flex-shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-5 lg:px-6 h-14 lg:h-16">
            <div className="flex items-center gap-3">
              <button className="lg:hidden w-9 h-9 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl flex items-center justify-center shadow-sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Building2 className="w-4 h-4 text-white" />
              </button>
              <div className="hidden lg:flex items-center gap-2 bg-gray-100 dark:bg-muted rounded-xl px-3 py-1.5 w-64">
                <Search className="w-4 h-4 text-gray-400" />
                <input placeholder="Search payments, groups..." className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-xs text-gray-400 dark:text-muted-foreground mr-1">{userName}</span>
              <ThemeToggle />
              <NotificationBell onNavigate={() => navigate("notifications")} />
              <div className="hidden lg:block">
                <Avatar name={userName} size="sm" />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-64 max-w-[75vw] bg-white dark:bg-card shadow-2xl h-full flex flex-col animate-in slide-in-from-left">
              <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100 dark:border-border">
                <Logo size="sm" />
                <span className="text-xs text-gray-400">Member</span>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
                {navItems.map(({ id, icon: I, label }) => (
                  <button key={id} onClick={() => { navigate(id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeScreen === id
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-muted/50"
                    }`}>
                    <I className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </nav>
              <div className="border-t border-gray-100 dark:border-border p-4">
                <div className="flex items-center gap-3" onClick={() => { navigate("profile"); setMobileMenuOpen(false); }}>
                  <Avatar name={userName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                    <p className="text-xs text-gray-400">View profile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-6">
          <div className="max-w-5xl xl:max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-card/95 backdrop-blur-md border-t border-gray-100 dark:border-border lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.slice(0, 5).map(({ id, icon: I, label }) => (
            <button key={id} onClick={() => navigate(id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all relative min-w-0 ${
                activeScreen === id ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              }`}>
              <div className={`p-1.5 rounded-xl transition-colors ${activeScreen === id ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}`}>
                <I className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-semibold leading-tight">{label}</span>
              {id === "notifications" && (
                <span className="absolute top-0.5 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-card" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
