import { XCircle, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { PageHeader } from "../../../components/shared/PageHeader";
import { useNotifications } from "../../../hooks/use-notifications";

export function GANotifications() {
  const { data: notifications, isLoading } = useNotifications();

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Notifications" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div>
        <PageHeader title="Notifications" subtitle="Alerts for your group." />
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <p className="text-sm font-semibold">No notifications</p>
          <p className="text-xs mt-1">You&apos;re all caught up.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Alerts for your group." />
      <div className="space-y-3">
        {notifications.map((n, i) => (
          <Card key={n.id || i} className={`p-4 flex items-start gap-4 ${n.read === false ? "border-l-2 border-l-emerald-500" : ""}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === "error" ? "bg-red-50 dark:bg-red-900/20" : n.type === "warning" ? "bg-amber-50 dark:bg-amber-900/20" : n.type === "success" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-blue-50 dark:bg-blue-900/20"}`}>
              {n.type === "error" ? <XCircle className="w-4 h-4 text-red-500" /> : n.type === "warning" ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : n.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Info className="w-4 h-4 text-blue-500" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${n.read === false ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>{n.title}</p>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{n.body ?? n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{n.createdAt}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
