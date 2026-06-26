import {
  Banknote, TrendingUp, CreditCard, Users, Building2, UserCheck,
  Loader2, AlertTriangle,
} from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { MetricCard } from "../../../components/shared/MetricCard";
import { PageHeader } from "../../../components/shared/PageHeader";
import { usePlatformAnalytics } from "../../../hooks/use-analytics";
import { useTransactions } from "../../../hooks/use-transactions";
import { Avatar } from "../../../components/shared/Avatar";
import { Badge } from "../../../components/shared/Badge";
import { formatNaira } from "../../../utils/format";

export function SADashboard() {
  const { data: analytics, isLoading: analyticsLoading } = usePlatformAnalytics();
  const { data: transactions, isLoading: txnsLoading } = useTransactions();

  if (analyticsLoading) {
    return (
      <div>
        <PageHeader title="Platform Overview" subtitle="Loading analytics..." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-sm text-gray-500">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Platform Overview" subtitle="Real-time insights across the Kolo ecosystem." />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <MetricCard title="Total Processed" value={analytics ? formatNaira(analytics.totalProcessed) : "—"} change="—" icon={Banknote} />
        <MetricCard title="Platform Revenue" value={analytics ? formatNaira(analytics.platformRevenue) : "—"} change="—" icon={TrendingUp} />
        <MetricCard title="Transactions" value={analytics ? analytics.totalTransactions.toLocaleString() : "—"} change="—" icon={CreditCard} />
        <MetricCard title="Active Users" value={analytics ? analytics.activeUsers.toLocaleString() : "—"} change="—" icon={Users} />
        <MetricCard title="Active Groups" value={analytics ? analytics.activeGroups.toLocaleString() : "—"} change="—" icon={Building2} />
        <MetricCard title="Total Members" value={analytics ? analytics.totalMembers.toLocaleString() : "—"} change="—" icon={UserCheck} />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</p>
          {txnsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-muted-foreground">
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Transactions will appear here once members start contributing.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center gap-3">
                  <Avatar name={t.userName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.userName}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">{t.cooperativeName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatNaira(t.amount)}</p>
                    <Badge status={t.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</p>
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">Activity feed coming from backend</p>
            <p className="text-xs mt-1">Real-time activity will be enabled when the API is connected.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
