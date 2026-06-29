import { XCircle, AlertTriangle, Info, Check, Loader2 } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { useNotifications } from "../../../hooks/use-notifications";

export function SANotifications() {
  const { data: notifications, isLoading } = useNotifications();

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Platform-wide alerts and system messages.">
        <Button variant="secondary" size="sm"><Check className="w-4 h-4" />Mark all read</Button>
      </PageHeader>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <p className="text-sm font-semibold">No notifications</p>
          <p className="text-xs mt-1">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <Card key={n.id} className={`p-4 flex items-start gap-4 ${n.read === false ? "border-l-2 border-l-emerald-500" : ""}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === "error" ? "bg-red-50 dark:bg-red-900/20" : n.type === "warning" ? "bg-amber-50 dark:bg-amber-900/20" : "bg-blue-50 dark:bg-blue-900/20"}`}>
                {n.type === "error" ? <XCircle className="w-4 h-4 text-red-500" /> : n.type === "warning" ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <Info className="w-4 h-4 text-blue-500" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${n.read === false ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>{n.title}</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{n.body ?? n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{n.createdAt}</p>
              </div>
              {n.read === false && <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
