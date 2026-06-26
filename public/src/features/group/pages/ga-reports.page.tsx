import { Download, Loader2 } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { Avatar } from "../../../components/shared/Avatar";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { formatNaira } from "../../../utils/format";
import { useChartTheme } from "../../../hooks/use-chart-theme";
import { useGroupAnalytics } from "../../../hooks/use-analytics";
import { useUsers } from "../../../hooks/use-users";

export function GAReports() {
  const ct = useChartTheme();
  const { data: analytics, isLoading } = useGroupAnalytics("current");
  const { data: members } = useUsers();

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Reports & Analytics" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const savingsTrend = analytics?.savingsTrend || [];
  const memberList = members || [];

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Group performance and financial summaries.">
        <Button variant="secondary" size="sm"><Download className="w-4 h-4" />Export PDF</Button>
        <Button variant="secondary" size="sm"><Download className="w-4 h-4" />Export CSV</Button>
      </PageHeader>
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Card className="p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Savings Growth</p>
          {savingsTrend.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500 dark:text-muted-foreground">
              <p className="text-sm">Savings data will appear once contributions start.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={savingsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
                <XAxis dataKey="month" tick={{ fill: ct.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `₦${(v / 1000000).toFixed(1)}M`} tick={{ fill: ct.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...ct.tooltip} formatter={(v: number) => [formatNaira(v)]} />
                <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card className="p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Contributions</p>
          {savingsTrend.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500 dark:text-muted-foreground">
              <p className="text-sm">Contribution data will appear once contributions start.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={savingsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
                <XAxis dataKey="month" tick={{ fill: ct.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `₦${(v / 1000).toFixed(0)}K`} tick={{ fill: ct.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...ct.tooltip} formatter={(v: number) => [formatNaira(v)]} />
                <Bar dataKey="contributions" fill="#065f46" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
      <Card className="p-5">
        <p className="font-semibold text-gray-900 dark:text-white mb-4">Member Summary Report</p>
        {memberList.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-500 dark:text-muted-foreground">
            <p className="text-sm">No members to display.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-border">
                  {["Member", "Email", "Status", "Joined"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-border">
                {memberList.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-white/3">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={m.name} size="sm" />
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-muted-foreground text-sm">{m.email}</td>
                    <td className="px-3 py-2.5"><Badge status={m.status} /></td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-muted-foreground text-sm">{m.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
