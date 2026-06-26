import { Bell, CheckCircle, Building2, ShieldCheck, Loader2 } from "lucide-react";
import { useNotifications } from "../../../hooks/use-notifications";

const iconMap: Record<string, typeof Bell> = {
  info: Bell,
  success: CheckCircle,
  warning: Bell,
  error: ShieldCheck,
};

const colorMap: Record<string, string> = {
  info: "bg-blue-50 dark:bg-blue-900/20 text-blue-500",
  success: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500",
  warning: "bg-amber-50 dark:bg-amber-900/20 text-amber-500",
  error: "bg-red-50 dark:bg-red-900/20 text-red-500",
};

export function MNotifications() {
  const { data: notifications, isLoading } = useNotifications();

  if (isLoading) {
    return (
      <div className="px-5 py-5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const notifs = notifications || [];

  return (
    <div className="px-5 py-5">
      <p className="text-lg font-bold text-gray-900 dark:text-white mb-5">Notifications</p>
      {notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <p className="text-sm font-semibold">No notifications</p>
          <p className="text-xs mt-1">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map((n, i) => {
            const Icon = iconMap[n.type] || Bell;
            const color = colorMap[n.type] || colorMap.info;
            return (
              <div key={n.id || i} className={`flex items-start gap-3 p-4 rounded-xl ${!n.read ? "bg-white dark:bg-card shadow-sm border border-gray-100 dark:border-border" : "bg-gray-50 dark:bg-muted/50"}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${!n.read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{n.createdAt}</p>
                </div>
                {!n.read && <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
