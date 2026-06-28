import { Zap, Edit, Loader2 } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { usePaymentConfig } from "../../../hooks/use-payment-config";
import { formatNaira } from "../../../utils/format";

export function SAPayments() {
  const { data: config, isLoading } = usePaymentConfig();

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
          <Button variant="secondary" size="sm" className="mt-4 w-full"><Edit className="w-4 h-4" />Edit Fee Structure</Button>
        </Card>
      </div>
    </div>
  );
}
