import { Wallet, Banknote, Users, Clock, Calendar, Loader2 } from "lucide-react";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card } from "../../../components/shared/Card";
import { MetricCard } from "../../../components/shared/MetricCard";
import { Avatar } from "../../../components/shared/Avatar";
import { Badge } from "../../../components/shared/Badge";
import { PageHeader } from "../../../components/shared/PageHeader";
import { formatNaira } from "../../../utils/format";
import { useChartTheme } from "../../../hooks/use-chart-theme";
import { useGroupAnalytics } from "../../../hooks/use-analytics";
import { useContributions } from "../../../hooks/use-contributions";

export function GADashboard() {
  const ct = useChartTheme();
  const { data: analytics, isLoading } = useGroupAnalytics("current");
  const { data: contributions } = useContributions();

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Group Dashboard" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const savingsTrend = analytics?.savingsTrend || [];
  const latestSavings = savingsTrend.length > 0 ? savingsTrend[savingsTrend.length - 1].savings : 0;
  const latestContributions = savingsTrend.length > 0 ? savingsTrend[savingsTrend.length - 1].contributions : 0;
  const recentPayments = (contributions || []).slice(0, 5);

  return (
    <div>
      <PageHeader title="Group Dashboard" subtitle="Current cycle overview" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <MetricCard title="Total Savings" value={formatNaira(latestSavings)} change="—" icon={Wallet} />
        <MetricCard title="This Month" value={formatNaira(latestContributions)} change="—" icon={Banknote} />
        <MetricCard title="Active Members" value={analytics ? String(analytics.activeUsers) : "—"} change="" positive icon={Users} />
        <MetricCard title="Pending" value="—" change="" positive={false} icon={Clock} iconBg="bg-amber-50 dark:bg-amber-900/20" />
        <MetricCard title="Next Payout" value="—" change="" icon={Calendar} />
      </div>
      <Card className="p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Current Contribution Cycle</p>
            <p className="text-sm text-gray-500 dark:text-muted-foreground">Collection progress</p>
          </div>
          <div className="flex gap-4 text-right">
            <div><p className="text-xs text-gray-500">Received</p><p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatNaira(latestContributions)}</p></div>
          </div>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all" style={{ width: "50%" }} />
        </div>
      </Card>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Savings Growth</p>
          {savingsTrend.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500 dark:text-muted-foreground">
              <p className="text-sm">Savings data will appear once contributions start.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={savingsTrend}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
                <XAxis dataKey="month" tick={{ fill: ct.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `₦${(v / 1000000).toFixed(1)}M`} tick={{ fill: ct.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...ct.tooltip} formatter={(v: number) => [formatNaira(v)]} />
                <Area type="monotone" dataKey="savings" stroke="#10b981" fill="url(#sg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card className="p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Recent Payments</p>
          {recentPayments.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500 dark:text-muted-foreground">
              <p className="text-sm">No recent payments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPayments.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <Avatar name={p.memberName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.memberName}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">{p.paidAt || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatNaira(p.amount)}</p>
                    <Badge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
