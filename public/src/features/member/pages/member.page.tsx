import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Home, Receipt, Building2, Bell, User } from "lucide-react";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { Logo } from "../../../components/shared/Logo";

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
  const segments = location.pathname.replace(/^\/+/, "").split("/");
  const last = segments[segments.length - 1];
  const knownScreens = ["home", "groups", "history", "notifications", "profile"];
  const activeScreen: string = last === "member" || segments.length === 1 || !knownScreens.includes(last) ? "home" : last;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="w-full mx-auto flex flex-col min-h-screen bg-white dark:bg-background shadow-2xl lg:max-w-5xl xl:max-w-7xl lg:shadow-none lg:border-x lg:border-gray-100 dark:lg:border-border">
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3 bg-white dark:bg-background border-b border-gray-100 dark:border-border">
          <Logo size="sm" variant="icon" />
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline text-xs text-gray-500 dark:text-muted-foreground mr-2">Member</span>
            <ThemeToggle />
            <button className="relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5" onClick={() => navigate("notifications")}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <Outlet />
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-gray-100 dark:border-border lg:static lg:border-t-0 lg:border-b lg:bg-gray-50 dark:lg:bg-muted/30">
          <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2 lg:max-w-5xl xl:max-w-7xl lg:px-6 lg:py-3 lg:gap-8">
            {navItems.map(({ id, icon: I, label }) => (
              <button key={id} onClick={() => navigate(id)}
                className={`flex flex-col lg:flex-row items-center gap-0.5 lg:gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl transition-all ${activeScreen === id ? "text-primary" : "text-gray-400 dark:text-gray-500 hover:text-gray-600"}`}>
                <div className={`p-1.5 rounded-xl ${activeScreen === id ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}`}>
                  <I className="w-5 h-5 lg:w-4 lg:h-4" />
                </div>
                <span className="text-[10px] lg:text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
