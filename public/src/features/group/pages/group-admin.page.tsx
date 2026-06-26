import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Users, PiggyBank, CreditCard, ArrowDownToLine,
  BarChart2, Bell, Settings, Plus, Building2,
} from "lucide-react";
import { AppLayout, type NavItem } from "../../../components/layout/AppLayout";
import { SidebarLink } from "../../../components/layout/SidebarLink";

const ADMIN_PAGES: NavItem[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "members", icon: Users, label: "Members" },
  { id: "contributions", icon: PiggyBank, label: "Contributions" },
  { id: "transactions", icon: CreditCard, label: "Transactions" },
  { id: "payouts", icon: ArrowDownToLine, label: "Payouts" },
  { id: "reports", icon: BarChart2, label: "Reports" },
  { id: "notifications", icon: Bell, label: "Notifications", badge: 2 },
  { id: "settings", icon: Settings, label: "Settings" },
] as const;

export function GroupAdminApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const segments = location.pathname.replace(/^\/+/, "").split("/");
  const currentPage = segments[segments.length - 1] === "admin" || segments[segments.length - 1] === "group" ? "dashboard" : segments[segments.length - 1];

  return (
    <AppLayout
      title="Tech Founders Savings"
      subtitle="Group Admin"
      logo={Building2}
      navItems={ADMIN_PAGES}
      activePage={currentPage}
      onPageChange={(id) => navigate(id)}
      onSignOut={() => navigate("/")}
      avatarName="EC"
      extraNav={
        <div className="border-t border-sidebar-border pt-3 mt-3">
          <SidebarLink icon={Plus} label="Create New Group" active={currentPage === "create-group"}
            onClick={() => navigate("create-group")} />
        </div>
      }
    >
      <Outlet />
    </AppLayout>
  );
}
