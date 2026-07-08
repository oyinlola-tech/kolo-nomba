import { useNavigate, useLocation, Outlet } from "react-router";
import { Home, Receipt, Building2, User, Search, Bell } from "lucide-react";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { Logo } from "../../../components/shared/Logo";
import { NotificationBell } from "../../../components/layout/NotificationBell";
import { Avatar } from "../../../components/shared/Avatar";
import { useAuth } from "../../../hooks/use-auth";
import { useRealtimeNotifications } from "../../../hooks/use-realtime";

type MemberScreen = "home" | "groups" | "history" | "notifications" | "profile";

const navItems: { id: MemberScreen; icon: typeof Home; label: string }[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "history", icon: Receipt, label: "History" },
  { id: "groups", icon: Building2, label: "Group" },
  { id: "notifications", icon: Bell, label: "Alerts" },
  { id: "profile", icon: User, label: "Profile" },
];

export function MemberApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  useRealtimeNotifications();
  const userName = user ? `${user.firstName} ${user.lastName}` : "Member";
  const segments = location.pathname.replace(/^\/+/, "").split("/");
  const last = segments[segments.length - 1];
  const knownScreens = ["home", "groups", "history", "notifications", "profile"];
  const activeScreen: string = last === "member" || segments.length === 1 || !knownScreens.includes(last) ? "home" : last;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col lg:flex-row">
      {/* Desktop sidebar - visible on lg+ */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-white dark:bg-card border-r border-gray-100 dark:border-border flex-shrink-0">
          <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100 dark:border-border flex-shrink-0">
          <Logo size="sm" />
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Member</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Savings Dashboard</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ id, icon: I, label }) => (
            <button key={id} onClick={() => navigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeScreen === id
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-primary"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-muted/50 hover:text-gray-900 dark:hover:text-white"
              }`}>
              <I className="w-5 h-5" />
              {label}
              {id === "notifications" && (
                <span className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-gray-100 dark:border-border p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name={userName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">My Account</p>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">{userName}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Tablet/mobile header */}
        <header className="flex items-center justify-between px-4 sm:px-5 lg:px-6 pt-4 lg:pt-0 pb-3 lg:h-16 lg:border-b lg:bg-white lg:dark:bg-card bg-white dark:bg-background border-b border-gray-100 dark:border-border lg:py-0 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Logo size="sm" variant="icon" />
            </div>
            <div className="hidden lg:flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-gray-400" />
              <input placeholder="Search..." className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none max-w-xs" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden md:inline text-xs text-gray-500 dark:text-muted-foreground mr-2">{userName}</span>
            <ThemeToggle />
            <NotificationBell onNavigate={() => navigate("notifications")} />
            <div className="hidden lg:block">
              <Avatar name={userName} size="sm" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <div className="max-w-5xl xl:max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom tab bar - mobile & tablet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-gray-100 dark:border-border lg:hidden z-40">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
          {navItems.map(({ id, icon: I, label }) => (
            <button key={id} onClick={() => navigate(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                activeScreen === id ? "text-primary" : "text-gray-400 dark:text-gray-500 hover:text-gray-600"
              }`}>
              <div className={`p-1.5 rounded-xl ${activeScreen === id ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}`}>
                <I className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
