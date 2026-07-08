import { Zap, Edit, Loader2, CheckCircle, X } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { usePaymentConfig } from "../../../hooks/use-payment-config";
import { formatNaira } from "../../../utils/format";
import { apiClient } from "../../../api/client";
import { useState } from "react";

export function SAPayments() {
  const { data: config, isLoading } = usePaymentConfig();
  const [editingFees, setEditingFees] = useState(false);
  const [feePct, setFeePct] = useState("");
  const [feeFlat, setFeeFlat] = useState("");
  const [feeResult, setFeeResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Payment Configuration" subtitle="Manage payment gateways and processing rules." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const gatewayStatus = config?.status === "connected" ? "active" : "inactive";

  return (
    <div>
      <PageHeader title="Payment Configuration" subtitle="Manage payment gateways and processing rules." />
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{config?.gateway ?? "Nomba"} Gateway</p>
              <Badge status={gatewayStatus} />
            </div>
          </div>
          <div className="space-y-3 text-sm">
            {[
              ["API Status", config?.status === "connected" ? "Connected" : "Disconnected"],
              ["Webhook URL", config?.webhookUrl || "Not configured"],
              ["Virtual Accounts", "Enabled"],
              ["Last Ping", config?.lastSync ? new Date(config.lastSync).toLocaleString() : "Never"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-50 dark:border-border">
                <span className="text-gray-500 dark:text-muted-foreground">{k}</span>
                <span className="font-medium text-gray-900 dark:text-white text-right text-xs max-w-xs truncate">{v}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Fee Structure</p>
          <div className="space-y-3 text-sm">
            {[
              ["Platform Fee", `${config?.feeStructure.percentage ?? 0}%`],
              ["Withdrawal Fee", formatNaira(config?.feeStructure.flatFee ?? 0)],
              ["Min Contribution", formatNaira(config?.feeStructure.minAmount ?? 0)],
              ["Max Single Txn", formatNaira(config?.feeStructure.maxAmount ?? 0)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-border">
                <span className="text-gray-500 dark:text-muted-foreground">{k}</span>
                <span className="font-bold text-gray-900 dark:text-white">{v}</span>
              </div>
            ))}
          </div>
          {editingFees ? (
            <div className="mt-4 space-y-2">
              <input value={feePct} onChange={e => setFeePct(e.target.value)} placeholder="Fee %" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-border rounded-xl bg-white dark:bg-input-background text-gray-900 dark:text-white" />
              <input value={feeFlat} onChange={e => setFeeFlat(e.target.value)} placeholder="Flat fee (NGN)" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-border rounded-xl bg-white dark:bg-input-background text-gray-900 dark:text-white" />
              <div className="flex gap-2">
                <Button size="sm" onClick={async () => {
                  setFeeResult(null);
                  try {
                    await apiClient.patch("/admin/payment-config", { feePercentage: parseFloat(feePct || "0"), flatFee: parseFloat(feeFlat || "0") });
                    setFeeResult({ type: "success", message: "Fee structure updated" });
                    setEditingFees(false);
                  } catch {
                    setFeeResult({ type: "error", message: "Failed to update fees" });
                  }
                }}>Save</Button>
                <Button variant="secondary" size="sm" onClick={() => setEditingFees(false)}>Cancel</Button>
              </div>
              {feeResult && <p className={`text-xs ${feeResult.type === "success" ? "text-emerald-600" : "text-red-500"}`}>{feeResult.message}</p>}
            </div>
          ) : (
            <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => {
              setFeePct(String(config?.feeStructure?.percentage ?? 0));
              setFeeFlat(String(config?.feeStructure?.flatFee ?? 0));
              setEditingFees(true);
            }}><Edit className="w-4 h-4" />Edit Fee Structure</Button>
          )}
        </Card>
      </div>
    </div>
  );
}
