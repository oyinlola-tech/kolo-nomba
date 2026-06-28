import { TrendingUp, Banknote, Percent, ArrowDownToLine, Loader2 } from "lucide-react";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card } from "../../../components/shared/Card";
import { MetricCard } from "../../../components/shared/MetricCard";
import { PageHeader } from "../../../components/shared/PageHeader";
import { formatNaira } from "../../../utils/format";
import { usePlatformAnalytics } from "../../../hooks/use-analytics";
import { useChartTheme } from "../../../hooks/use-chart-theme";

export function SARevenue() {
  const ct = useChartTheme();
  const { data: analytics, isLoading } = usePlatformAnalytics();

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Revenue Analytics" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const revenueTrend = analytics?.revenueTrend || [];

  return (
    <div>
      <PageHeader title="Revenue Analytics" subtitle="Platform earnings and fee breakdown." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Revenue" value={analytics ? formatNaira(analytics.platformRevenue ?? 0) : "—"} change="—" icon={TrendingUp} />
        <MetricCard title="Total Processed" value={analytics ? formatNaira(analytics.totalProcessed ?? 0) : "—"} change="—" icon={Banknote} />
        <MetricCard title="Transactions" value={analytics ? (analytics.totalTransactions ?? 0).toLocaleString() : "—"} change="—" icon={Percent} />
        <MetricCard title="Active Groups" value={analytics ? (analytics.activeGroups ?? 0).toLocaleString() : "—"} change="—" icon={ArrowDownToLine} />
      </div>
      <Card className="p-5 mb-5">
        <p className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue Trend</p>
        {revenueTrend.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
            <p className="text-sm">Revenue data will appear once transactions start flowing.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="rvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
              <XAxis dataKey="month" tick={{ fill: ct.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `₦${(v / 1000000).toFixed(0)}M`} tick={{ fill: ct.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...ct.tooltip} formatter={(v: number) => [formatNaira(v), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#rvg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
