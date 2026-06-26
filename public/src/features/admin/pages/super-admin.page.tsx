import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, CreditCard, Banknote,
  TrendingUp, ArrowDownToLine, AlertCircle, UserCheck, Bell, Shield, Settings,
} from "lucide-react";
import { AppLayout, type NavItem } from "../../../components/layout/AppLayout";

const SA_PAGES: NavItem[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "users", icon: Users, label: "Users" },
  { id: "groups", icon: Building2, label: "Groups" },
  { id: "transactions", icon: CreditCard, label: "Transactions" },
  { id: "payments", icon: Banknote, label: "Payments" },
  { id: "revenue", icon: TrendingUp, label: "Revenue" },
  { id: "withdrawals", icon: ArrowDownToLine, label: "Withdrawals", badge: 2 },
  { id: "disputes", icon: AlertCircle, label: "Disputes", badge: 1 },
  { id: "verification", icon: UserCheck, label: "Verification", badge: 2 },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "security", icon: Shield, label: "Security" },
  { id: "settings", icon: Settings, label: "System Settings" },
] as const;

export function SuperAdminApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const segments = location.pathname.replace(/^\/+/, "").split("/");
  const currentPage = segments[segments.length - 1] === "ajo" ? "dashboard" : segments[segments.length - 1];

  return (
    <AppLayout
      title="Kolo Platform"
      subtitle="Super Admin"
      logo={Shield}
      navItems={SA_PAGES}
      activePage={currentPage}
      onPageChange={(id) => navigate(id)}
      onSignOut={() => navigate("/")}
      avatarName="SA"
    >
      <Outlet />
    </AppLayout>
  );
}
