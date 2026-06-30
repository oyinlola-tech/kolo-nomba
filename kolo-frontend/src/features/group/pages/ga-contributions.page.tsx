import { Send, Loader2 } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { Avatar } from "../../../components/shared/Avatar";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { useContributions } from "../../../hooks/use-contributions";

export function GAContributions() {
  const { data, isLoading } = useContributions();
  const contribs = data?.items ?? [];

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Contribution Management" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const paid = contribs.filter(c => c.status === "paid").length;
  const pending = contribs.filter(c => c.status === "pending").length;
  const late = contribs.filter(c => c.status === "late").length;

  return (
    <div>
      <PageHeader title="Contribution Management" subtitle="Current collection cycle" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{paid}</p>
          <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">Paid Members</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pending}</p>
          <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">Pending</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{late}</p>
          <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">Late</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{contribs.length > 0 ? Math.round((paid / contribs.length) * 100) : 0}%</p>
          <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">Collection Rate</p>
        </Card>
      </div>
      {contribs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <p className="text-sm font-semibold">No contributions recorded</p>
          <p className="text-xs mt-1">Contributions will appear once members start paying.</p>
        </div>
      ) : (
        <>
          <Card className="p-5 mb-5">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Cycle Progress</p>
                <p className="text-sm text-gray-500 dark:text-muted-foreground">{paid} of {contribs.length} members paid</p>
              </div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{Math.round((paid / contribs.length) * 100)}%</p>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: `${(paid / contribs.length) * 100}%` }} />
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-border flex items-center justify-between">
              <p className="font-semibold text-gray-900 dark:text-white">Member Payment Status</p>
              <Button variant="secondary" size="sm"><Send className="w-4 h-4" />Send Reminders</Button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-border">
              {contribs.map(c => (
                <div key={c.id} className="flex items-center gap-4 px-4 py-3">
                  <Avatar name={c.memberName ?? ""} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{c.memberName}</p>
                    <p className="text-xs text-gray-500">Last: {c.paidAt || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">₦{(c.amount ?? 0).toLocaleString()}</p>
                    <Badge status={c.status} />
                  </div>
                  {c.status !== "paid" && <Button size="sm" variant="secondary"><Send className="w-3 h-3" /></Button>}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
