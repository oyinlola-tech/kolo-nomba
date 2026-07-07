import { useState, type ReactNode, type ElementType } from "react";
import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "../shared/ThemeToggle";
import { SidebarLink } from "./SidebarLink";
import { NotificationBell } from "./NotificationBell";
import { Avatar } from "../shared/Avatar";

export interface NavItem {
  id: string;
  icon: ElementType;
  label: string;
  badge?: number;
}

interface AppLayoutProps {
  title: string;
  subtitle: string;
  logo: ElementType;
  navItems: readonly NavItem[];
  activePage: string;
  onPageChange: (id: string) => void;
  onSignOut?: () => void;
  extraNav?: ReactNode;
  children: ReactNode;
  avatarName?: string;
}

export function AppLayout({
  title,
  subtitle,
  logo: Logo,
  navItems,
  activePage,
  onPageChange,
  onSignOut,
  extraNav,
  children,
  avatarName = "SA",
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-sidebar flex flex-col border-r border-sidebar-border transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border flex-shrink-0">
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Logo className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{title}</p>
            <p className="text-xs text-emerald-400">{subtitle}</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map(({ id, icon, label, badge }) => (
            <SidebarLink key={id} icon={icon} label={label} active={activePage === id}
              onClick={() => { onPageChange(id); setSidebarOpen(false); }}
              badge={badge} />
          ))}
          {extraNav}
        </nav>
        {onSignOut && (
          <div className="border-t border-sidebar-border p-3">
            <button onClick={onSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Sign Out
            </button>
          </div>
        )}
      </aside>
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-card border-b border-gray-100 dark:border-border flex items-center gap-4 px-4 lg:px-6 flex-shrink-0">
          <button className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-2 max-w-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input placeholder="Search…" className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            <Avatar name={avatarName} size="sm" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
