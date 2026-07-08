import { Download, Loader2, CheckCircle } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { Avatar } from "../../../components/shared/Avatar";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { formatNaira } from "../../../utils/format";
import { useTransactions } from "../../../hooks/use-transactions";
import { downloadCsv } from "../../../utils/csv";
import { useState } from "react";

export function GATransactions() {
  const { data, isLoading } = useTransactions();
  const txns = data?.items ?? [];
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    downloadCsv(
      "transactions.csv",
      ["Reference", "Member", "Amount", "Date", "Status"],
      txns.map(t => [t.id, t.userName, formatNaira(t.amount), t.createdAt, t.status]),
    );
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div>
      <PageHeader title="Transactions" subtitle="All payments within your group.">
        <Button variant="secondary" size="sm" onClick={handleExport} disabled={txns.length === 0}>
          {exported ? <CheckCircle className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          {exported ? "Exported!" : "Export"}
        </Button>
      </PageHeader>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : txns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <p className="text-sm font-semibold">No transactions yet</p>
          <p className="text-xs mt-1">Member payments will appear here.</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-border">
                  {["Reference", "Member", "Amount", "Date", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-border">
                {txns.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/3">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={t.userName ?? ""} size="sm" />
                        <span className="font-medium text-gray-900 dark:text-white">{t.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{formatNaira(t.amount)}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{t.createdAt}</td>
                    <td className="px-4 py-3"><Badge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
