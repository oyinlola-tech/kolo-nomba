import { useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { Pagination } from "../../../components/shared/Pagination";
import { formatNaira } from "../../../utils/format";
import { useDisputes, useResolveDispute } from "../../../hooks/use-disputes";

export function SADisputes() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDisputes(page);
  const disputes = data?.items ?? [];
  const pagination = data?.pagination;
  const resolve = useResolveDispute();

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Disputes & Complaints" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div>
        <PageHeader title="Disputes & Complaints" subtitle="Manage and resolve member disputes." />
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <AlertCircle className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-semibold">No disputes</p>
          <p className="text-xs mt-1">All clear. No disputes have been reported.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Disputes & Complaints" subtitle="Manage and resolve member disputes." />
      <div className="space-y-4">
        {disputes.map(d => (
          <Card key={d.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-400">{d.id}</span>
                    <Badge status={d.status} />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">{d.issue}</p>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground">
                    Reported by <span className="font-medium text-gray-700 dark:text-gray-300">{d.reporterName}</span> against <span className="font-medium text-gray-700 dark:text-gray-300">{d.againstName}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{d.createdAt}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNaira(d.amount)}</p>
                {d.status !== "resolved" && (
                  <div className="flex gap-1 mt-2 justify-end">
                    <Button variant="secondary" size="sm" onClick={() => resolve.mutate(d.id)} disabled={resolve.isPending}>
                      {resolve.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null} Resolve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      {pagination && <div className="mt-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>}
    </div>
  );
}