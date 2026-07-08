import { useState } from "react";
import { Check, X, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { Avatar } from "../../../components/shared/Avatar";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { useKycSubmissions, useApproveKyc, useRejectKyc } from "../../../hooks/use-kyc";

export function SAVerification() {
  const { data: submissions, isLoading } = useKycSubmissions();
  const approve = useApproveKyc();
  const reject = useRejectKyc();
  const [actionStatus, setActionStatus] = useState<{ id: string; type: "success" | "error"; message: string } | null>(null);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="KYC Verification" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div>
        <PageHeader title="KYC Verification" subtitle="Review submitted identity documents." />
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-semibold">No KYC submissions</p>
          <p className="text-xs mt-1">Pending identity verifications will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="KYC Verification" subtitle="Review submitted identity documents." />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-border">
                {["Applicant", "Phone", "Type", "Submitted", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-border">
              {submissions.map(k => (
                <tr key={k.id} className="hover:bg-gray-50 dark:hover:bg-white/3">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={k.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{k.name}</p>
                        <p className="text-xs text-gray-500">{k.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{k.phone}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">{k.type}</span></td>
                  <td className="px-4 py-3 text-gray-500">{k.submittedAt}</td>
                  <td className="px-4 py-3"><Badge status={k.status} /></td>
                  <td className="px-4 py-3">
                    {k.status === "pending" && (
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => {
                            setActionStatus(null);
                            approve.mutate(k.id, {
                              onSuccess: () => setActionStatus({ id: k.id, type: "success", message: "KYC approved" }),
                              onError: () => setActionStatus({ id: k.id, type: "error", message: "Failed to approve KYC" }),
                            });
                          }} disabled={approve.isPending}>
                            {approve.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}Approve
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => {
                            setActionStatus(null);
                            reject.mutate(k.id, {
                              onSuccess: () => setActionStatus({ id: k.id, type: "success", message: "KYC rejected" }),
                              onError: () => setActionStatus({ id: k.id, type: "error", message: "Failed to reject KYC" }),
                            });
                          }} disabled={reject.isPending}>
                            {reject.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                          </Button>
                        </div>
                        {actionStatus && actionStatus.id === k.id && (
                          <span className={`text-[10px] flex items-center gap-1 ${actionStatus.type === "success" ? "text-emerald-600" : "text-red-500"}`}>
                            {actionStatus.type === "success" ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                            {actionStatus.message}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
