import { Server, Database, Globe, Activity, Loader2 } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { PageHeader } from "../../../components/shared/PageHeader";
import { useAuditLogs } from "../../../hooks/use-audit-logs";

export function SASecurity() {
  const { data, isLoading } = useAuditLogs();
  const auditLogs = data?.items ?? [];

  return (
    <div>
      <PageHeader title="Security Center" subtitle="Monitor access, audit logs, and system health." />
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
            <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">System Health</p>
            <div className="flex items-center gap-1.5 mt-0.5"><span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" /><span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All systems operational</span></div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">API Status</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 font-medium">Waiting for connection</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Webhook Status</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5 font-medium">Awaiting configuration</p>
          </div>
        </Card>
      </div>
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-border">
          <p className="font-semibold text-gray-900 dark:text-white">Audit Logs</p>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !auditLogs || auditLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-muted-foreground">
            <Activity className="w-8 h-8 mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">No audit logs yet</p>
            <p className="text-xs mt-1">Administrative actions will be recorded here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-border">
            {auditLogs.map(a => (
              <div key={a.id} className="flex items-center gap-4 px-4 py-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{a.action}</p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">{a.target} · by {a.actorName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">{a.createdAt}</p>
                  <p className="text-xs text-gray-400 font-mono">{a.ipAddress}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
