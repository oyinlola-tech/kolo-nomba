import { Check, Download, Loader2 } from "lucide-react";
import { Badge } from "../../../components/shared/Badge";
import { useContributions } from "../../../hooks/use-contributions";
import { formatNaira } from "../../../utils/format";
import { useNavigate } from "react-router";

export function MHistory() {
  const navigate = useNavigate();
  const { data: contributions, isLoading } = useContributions();
  const contribs = contributions || [];
  const totalContributed = contribs.reduce((s, c) => s + (c.amount ?? 0), 0);

  if (isLoading) {
    return (
      <div className="px-5 py-5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">Contribution History</p>
      <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6">Track your monthly cooperative payments.</p>
      {contribs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <p className="text-sm font-semibold">No payments yet</p>
          <p className="text-xs mt-1">Your payment history will appear here once you start contributing.</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-border" />
            <div className="space-y-4">
              {contribs.map((c, i) => (
                <div key={c.id || i} className="relative pl-10">
                  <div className={`absolute left-0 top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${c.status === "paid" ? "bg-emerald-500 border-emerald-500" : "bg-white dark:bg-card border-gray-300 dark:border-gray-600"}`}>
                    {c.status === "paid" && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{c.memberName}</p>
                       <p className="font-bold text-gray-900 dark:text-white">{formatNaira(c.amount ?? 0)}</p>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{c.paidAt || "—"}</p>
                    <div className="flex items-center gap-2">
                      <Badge status={c.status} />
                      {c.status === "paid" && (
                        <button onClick={() => window.print()} className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                          <Download className="w-3 h-3" />Download Receipt
                        </button>
                      )}
                      {c.status === "pending" && (
                        <button onClick={() => navigate(`/member/pay?contributionId=${c.id}`)} className="text-xs font-semibold text-primary hover:underline">Pay Now</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 bg-emerald-800 dark:bg-emerald-900 rounded-2xl p-5 text-white">
            <p className="text-emerald-200 text-xs mb-1">Total Contributed</p>
            <p className="text-3xl font-extrabold mb-3">{formatNaira(totalContributed)}</p>
            <div className="h-1.5 bg-emerald-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-300 rounded-full" style={{ width: `${Math.min(100, (contribs.length / 12) * 100)}%` }} />
            </div>
            <p className="text-emerald-300 text-xs mt-1.5">{contribs.length} payments</p>
          </div>
        </>
      )}
    </div>
  );
}
