import { Check, Download, Loader2, Clock, ArrowRight } from "lucide-react";
import { Badge } from "../../../components/shared/Badge";
import { useContributions } from "../../../hooks/use-contributions";
import { formatNaira } from "../../../utils/format";
import { useNavigate } from "react-router";
import { downloadReceipt } from "../../../services/receipt.service";
import { useState } from "react";

export function MHistory() {
  const navigate = useNavigate();
  const { data, isLoading } = useContributions();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const contribs = data?.items ?? [];
  const totalContributed = contribs.reduce((s, c) => s + (c.paidAmount ?? c.amount ?? 0), 0);
  const onTimeCount = contribs.filter(c => c.status === "paid" || c.status === "completed" || c.status === "PAID").length;
  const pendingCount = contribs.filter(c => c.status === "pending" || c.status === "PENDING").length;

  if (isLoading) {
    return (
      <div className="px-5 py-5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-5 lg:px-6 py-4 lg:py-5">
      <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1">Contribution History</p>
      <p className="text-sm text-gray-500 dark:text-muted-foreground mb-5">Track your monthly cooperative payments.</p>

      {contribs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-muted-foreground">
          <div className="w-14 h-14 bg-gray-100 dark:bg-muted rounded-2xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold">No payments yet</p>
          <p className="text-xs mt-1">Your history will appear here once you start contributing.</p>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl lg:rounded-3xl p-4 lg:p-5 text-white mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-emerald-200/80 text-xs font-medium">Total Contributed</p>
              <span className="text-emerald-300/60 text-[10px]">{contribs.length} payment{contribs.length !== 1 ? "s" : ""}</span>
            </div>
            <p className="text-2xl lg:text-3xl font-extrabold">{formatNaira(totalContributed)}</p>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-200/70"><span className="text-emerald-400 font-semibold">{onTimeCount}</span> on time</span>
                <span className="text-emerald-200/70">{pendingCount > 0 ? <span className="text-amber-400 font-semibold">{pendingCount}</span> : null} {pendingCount > 0 ? "pending" : ""}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-border" />
            <div className="space-y-3 lg:space-y-4">
              {contribs.map((c, i) => {
                const isPaid = c.status === "PAID" || c.status === "paid" || c.status === "completed" || c.status === "success";
                const isPending = c.status === "PENDING" || c.status === "pending";
                const dateStr = c.paidAt || "";
                const dateDisplay = dateStr ? new Date(dateStr).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }) : "—";

                return (
                  <div key={c.id || i} className="relative pl-12">
                    <div className={`absolute left-0 top-4 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      isPaid
                        ? "bg-emerald-500 border-emerald-500"
                        : isPending
                        ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-600"
                        : "bg-white dark:bg-card border-gray-300 dark:border-gray-600"
                    }`}>
                      {isPaid ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : isPending ? (
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                      )}
                    </div>
                    <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl p-3.5 lg:p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {c.memberName || "Contribution"}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{dateDisplay}</p>
                        </div>
                        <p className="font-extrabold text-sm lg:text-base text-gray-900 dark:text-white ml-2 flex-shrink-0">
                          {formatNaira(c.paidAmount ?? c.amount ?? 0)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50 dark:border-border/50">
                        <Badge status={c.status} />
                        {isPaid && (
                          <button onClick={async () => {
                            if (downloadingId) return;
                            setDownloadingId(c.id);
                            try {
                              const blob = await downloadReceipt(c.id!);
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `kolo-receipt-${c.id}.pdf`;
                              a.click();
                              window.URL.revokeObjectURL(url);
                            } catch {
                              window.print();
                            } finally {
                              setDownloadingId(null);
                            }
                          }} className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline ml-auto">
                            {downloadingId === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}Receipt
                          </button>
                        )}
                        {isPending && (
                          <button onClick={() => navigate(`/member/pay?contributionId=${c.id}`)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline ml-auto">
                            Pay Now <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
