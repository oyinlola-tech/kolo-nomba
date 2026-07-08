import { Download, Loader2, CheckCircle } from "lucide-react";
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
import { downloadCsv } from "../../../utils/csv";
import { useChartTheme } from "../../../hooks/use-chart-theme";
import { useGroupAnalytics } from "../../../hooks/use-analytics";
import { useCooperatives } from "../../../hooks/use-cooperatives";
import { useGroupMembers } from "../../../hooks/use-group-members";
import { useState } from "react";

export function GAReports() {
  const ct = useChartTheme();
  const { data: groupData } = useCooperatives();
  const groups = groupData?.items ?? [];
  const groupId = groups.length > 0 ? groups[0].id : "";
  const { data: analytics, isLoading } = useGroupAnalytics(groupId);
  const { data: members } = useGroupMembers(groupId);
  const [csvExported, setCsvExported] = useState(false);

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

  const handleExportCsv = () => {
    downloadCsv(
      "member-report.csv",
      ["Member", "Email", "Status", "Joined"],
      memberList.map(m => [m.name || `${m.firstName} ${m.lastName}`, m.email, m.status, m.joinedAt]),
    );
    setCsvExported(true);
    setTimeout(() => setCsvExported(false), 2000);
  };

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Group performance and financial summaries.">
        <Button variant="secondary" size="sm" onClick={handleExportCsv} disabled={memberList.length === 0}>
          {csvExported ? <CheckCircle className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          {csvExported ? "Exported!" : "Export CSV"}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <Download className="w-4 h-4" />Export PDF
        </Button>
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
                <Tooltip {...ct.tooltip} formatter={(v) => [formatNaira(Number(v ?? 0))]} />
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
                <Tooltip {...ct.tooltip} formatter={(v) => [formatNaira(Number(v ?? 0))]} />
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
                {memberList.map(m => {
                  const memberName = m.name || `${m.firstName} ${m.lastName}`;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-white/3">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={memberName} size="sm" />
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{memberName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 dark:text-muted-foreground text-sm">{m.email}</td>
                      <td className="px-3 py-2.5"><Badge status={m.status} /></td>
                      <td className="px-3 py-2.5 text-gray-500 dark:text-muted-foreground text-sm">{m.joinedAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
