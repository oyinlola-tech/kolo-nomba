import {
  Lock, Bell, Wallet, ShieldCheck, ChevronRight, LogOut,
} from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { useAuth } from "../../../hooks/use-auth";

import { useNavigate } from "react-router";

export function MProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="px-5 py-5">
      <p className="text-lg font-bold text-gray-900 dark:text-white mb-5">Profile</p>
      <div className="flex flex-col items-center mb-7">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-2xl font-extrabold mb-2">
          {((user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")).toUpperCase() || "?"}
        </div>
        <p className="font-bold text-gray-900 dark:text-white">{user ? `${user.firstName} ${user.lastName}` : "Member"}</p>
        <p className="text-sm text-gray-500 dark:text-muted-foreground">{user?.email || "—"}</p>
        <Badge status="active" />
      </div>
      <Card className="p-4 mb-4">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 mb-3 tracking-wider">PERSONAL INFORMATION</p>
        <div className="space-y-3 text-sm">
          {[["Full Name", user ? `${user.firstName} ${user.lastName}` : "—"], ["Email", user?.email || "—"], ["Role", user?.role || "—"]].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1.5 border-b border-gray-50 dark:border-border last:border-0">
              <span className="text-gray-500 dark:text-muted-foreground">{k}</span>
              <span className="font-medium text-gray-900 dark:text-white">{v}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4 mb-4">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 mb-3 tracking-wider">ACCOUNT SETTINGS</p>
        <div className="space-y-1">
          {[
            { icon: Lock, label: "Change Password", path: "/member/profile/change-password" },
            { icon: Bell, label: "Notification Preferences", path: "/member/profile/notifications" },
            { icon: Wallet, label: "Payment Preferences", path: "/member/profile/payment" },
            { icon: ShieldCheck, label: "Security Settings", path: "/member/profile/security" },
          ].map(({ icon: I, label, path }) => (
            <button key={label} onClick={() => navigate(path)} className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-muted transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
              <I className="w-4 h-4 text-gray-400" />{label}<ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
            </button>
          ))}
        </div>
      </Card>
      <button onClick={() => { logout.mutate(); navigate("/"); }}
        className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
        <LogOut className="w-4 h-4" />Sign Out
      </button>
    </div>
  );
}
