import { useState } from "react";
import { Download, Loader2, AlertTriangle } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { Avatar } from "../../../components/shared/Avatar";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { Pagination } from "../../../components/shared/Pagination";
import { useTransactions } from "../../../hooks/use-transactions";
import { formatNaira } from "../../../utils/format";
import { downloadCsv } from "../../../utils/csv";

export function SATransactions() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useTransactions(page);
  const transactions = data?.items ?? [];
  const pagination = data?.pagination;
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? transactions : transactions.filter(t => t.status === filter);

  const handleExport = () => {
    downloadCsv(
      "transactions.csv",
      ["Txn ID", "User", "Group", "Amount", "Provider", "Status", "Date"],
      filtered.map(t => [t.id, t.userName ?? "", t.cooperativeName ?? "", formatNaira(t.amount), t.provider ?? "", t.status, t.createdAt]),
    );
  };

  return (
    <div>
      <PageHeader title="Transaction Monitoring" subtitle="All platform payments in real-time.">
        <Button size="sm" variant="secondary" onClick={handleExport}><Download className="w-4 h-4" />Export CSV</Button>
      </PageHeader>
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "success", "pending", "failed", "reversed"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter === s ? "bg-primary text-white" : "bg-white dark:bg-card border border-gray-200 dark:border-border text-gray-600 dark:text-gray-400 hover:border-primary/50"}`}>
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mr-3 text-primary" />
            <span className="text-sm">Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <AlertTriangle className="w-12 h-12 mb-3 text-red-400" />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Failed to load transactions</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
            <p className="text-sm font-semibold">No transactions found</p>
            <p className="text-xs mt-1">No transactions match the current filter.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-border">
                    {["Txn ID", "User", "Group", "Amount", "Provider", "Status", "Date"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-border">
                  {filtered.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{t.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={t.userName ?? ""} size="sm" />
                          <span className="font-medium text-gray-900 dark:text-white">{t.userName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[140px] truncate">{t.cooperativeName}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">{formatNaira(t.amount)}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-gray-100 dark:bg-muted px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">{t.provider}</span></td>
                      <td className="px-4 py-3"><Badge status={t.status} /></td>
                      <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground whitespace-nowrap">{t.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
          </>
        )}
      </Card>
    </div>
  );
}
