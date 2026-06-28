import { Shield, Activity, Clock, User, Globe, Search, Filter, Download, Loader2, AlertTriangle } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { PageHeader } from "../../../components/shared/PageHeader";
import { Badge } from "../../../components/shared/Badge";
import { useAuditLogs } from "../../../hooks/use-audit-logs";

export function SAAuditLogs() {
  const { data: auditLogs, isLoading } = useAuditLogs();

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Complete record of all platform events and administrative actions." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Total Events</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{isLoading ? "--" : auditLogs?.length ?? "0"}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Security</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 font-medium">No alerts</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Last Event</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 font-medium">{isLoading ? "--" : auditLogs && auditLogs.length ? auditLogs[0].createdAt : "No events"}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Actors</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5 font-medium">{isLoading ? "--" : auditLogs ? new Set(auditLogs.map(a => a.actorName)).size : "0"}</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 dark:border-border flex items-center justify-between">
          <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Audit Log Events</p>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-muted rounded-lg hover:bg-gray-200 dark:hover:bg-muted/80 transition-colors">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-muted rounded-lg hover:bg-gray-200 dark:hover:bg-muted/80 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-sm text-gray-500">Loading audit logs...</span>
          </div>
        ) : !auditLogs || auditLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-semibold">No audit logs yet</p>
            <p className="text-xs mt-1">Administrative actions will appear here once the platform is active.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-border">
            {auditLogs.map(a => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 bg-gray-100 dark:bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.action}</p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">{a.target} · by {a.actorName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">{a.createdAt}</p>
                  <p className="text-xs text-gray-400 font-mono">{a.ipAddress}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <p className="font-semibold text-gray-900 dark:text-white mb-4">Audit Compliance</p>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-1">Event Types</p>
            <p className="text-xs text-gray-500 dark:text-muted-foreground">User actions, system events, security events, and administrative operations.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-1">Retention</p>
            <p className="text-xs text-gray-500 dark:text-muted-foreground">Logs retained for 90 days with automated archival.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-1">Access</p>
            <p className="text-xs text-gray-500 dark:text-muted-foreground">Available to platform admins for compliance reporting.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
