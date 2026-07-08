import { useState } from "react";
import { XCircle, AlertTriangle, Info, Check, Loader2, RefreshCw, X } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { useNotifications } from "../../../hooks/use-notifications";
import { markAllNotificationsRead } from "../../../services/notification.service";
import { useQueryClient } from "@tanstack/react-query";

export function SANotifications() {
  const { data, isLoading } = useNotifications();
  const notifications = data?.items ?? [];
  const [marking, setMarking] = useState(false);
  const [markResult, setMarkResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const queryClient = useQueryClient();

  const handleMarkAllRead = async () => {
    setMarking(true);
    setMarkResult(null);
    try {
      await markAllNotificationsRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setMarkResult({ type: "success", message: "All notifications marked as read" });
    } catch {
      setMarkResult({ type: "error", message: "Failed to mark all as read" });
    } finally {
      setMarking(false);
    }
  };

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Platform-wide alerts and system messages.">
        <Button variant="secondary" size="sm" onClick={handleMarkAllRead} disabled={marking}>
          {marking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {marking ? "Marking..." : "Mark all read"}
        </Button>
      </PageHeader>
      {markResult && (
        <div className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
          markResult.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
        }`}>
          {markResult.type === "success" ? <Check className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
          {markResult.message}
          <button onClick={() => setMarkResult(null)} className="ml-auto text-current opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
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
