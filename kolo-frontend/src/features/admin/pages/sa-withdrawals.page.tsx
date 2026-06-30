import { useState } from "react";
import { Clock, CheckCircle, ArrowDownToLine, Check, X, Loader2, RefreshCw } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { MetricCard } from "../../../components/shared/MetricCard";
import { Badge } from "../../../components/shared/Badge";
import { Avatar } from "../../../components/shared/Avatar";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { Pagination } from "../../../components/shared/Pagination";
import { formatNaira } from "../../../utils/format";
import { useWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from "../../../hooks/use-withdrawals";

export function SAWithdrawals() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useWithdrawals(page);
  const withdrawals = data?.items ?? [];
  const pagination = data?.pagination;
  const approve = useApproveWithdrawal();
  const reject = useRejectWithdrawal();

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Withdrawal Requests" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const pendingCount = withdrawals.filter(w => w.status === "pending").length;

  return (
    <div>
      <PageHeader title="Withdrawal Requests" subtitle="Review and approve payout requests." />
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard title="Pending" value={String(pendingCount)} change="" positive={false} icon={Clock} iconBg="bg-amber-50 dark:bg-amber-900/20" />
        <MetricCard title="Total Withdrawn" value="—" change="" icon={ArrowDownToLine} />
        <MetricCard title="Approved" value="—" change="" icon={CheckCircle} />
      </div>
      {withdrawals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <p className="text-sm font-semibold">No withdrawals</p>
          <p className="text-xs mt-1">Withdrawal requests from group admins will appear here.</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-border">
                  {["Request ID", "Requester", "Group", "Amount", "Bank", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-border">
                {withdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-white/3">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{w.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={w.requesterName ?? ""} size="sm" />
                        <span className="font-medium text-gray-900 dark:text-white">{w.requesterName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{w.cooperativeName}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{formatNaira(w.amount)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{w.bankName}</td>
                    <td className="px-4 py-3"><Badge status={w.status} /></td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{w.createdAt}</td>
                    <td className="px-4 py-3">
                      {w.status === "pending" && (
                        <div className="flex gap-1">
                          <Button variant="primary" size="sm" onClick={() => approve.mutate(w.id)} aria-label="Approve withdrawal">
                            {approve.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => reject.mutate(w.id)} aria-label="Reject withdrawal">
                            {reject.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
        </Card>
      )}
    </div>
  );
}
