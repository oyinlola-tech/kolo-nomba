import { Bell, CheckCircle, ShieldCheck, Loader2, Info, AlertTriangle } from "lucide-react";
import { useNotifications } from "../../../hooks/use-notifications";
import { markNotificationRead } from "../../../services/notification.service";
import { useQueryClient } from "@tanstack/react-query";

const iconMap: Record<string, typeof Bell> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: ShieldCheck,
};

const colorMap: Record<string, string> = {
  info: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  success: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  error: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
};

export function MNotifications() {
  const { data, isLoading } = useNotifications();
  const notifs = data?.items ?? [];
  const queryClient = useQueryClient();

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
    }
  };

  if (isLoading) {
    return (
      <div className="px-5 py-5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const unreadCount = notifs.filter(n => n.read === false).length;

  return (
    <div className="px-4 sm:px-5 lg:px-6 py-4 lg:py-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Notifications</p>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-muted-foreground">
          <div className="w-14 h-14 bg-gray-100 dark:bg-muted rounded-2xl flex items-center justify-center mb-4">
            <Bell className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold">All caught up!</p>
          <p className="text-xs mt-1">You have no notifications.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifs.map((n, i) => {
            const Icon = iconMap[n.type] || Bell;
            const color = colorMap[n.type] || colorMap.info;
            const isUnread = n.read === false;
            return (
              <div
                key={n.id || i}
                onClick={() => isUnread && handleMarkRead(n.id)}
                className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                  isUnread
                    ? "bg-white dark:bg-card shadow-sm border border-gray-100 dark:border-border hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800"
                    : "bg-gray-50/50 dark:bg-muted/30 border border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color} ${isUnread ? "" : "opacity-60"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isUnread ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-muted-foreground"}`}>
                    {n.title}
                  </p>
                  <p className={`text-xs mt-0.5 leading-relaxed ${isUnread ? "text-gray-500 dark:text-muted-foreground" : "text-gray-400 dark:text-muted-foreground/60"}`}>
                    {n.body ?? n.message}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-muted-foreground/50 mt-1.5">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                  </p>
                </div>
                {isUnread && <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0 ring-2 ring-white dark:ring-card" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
