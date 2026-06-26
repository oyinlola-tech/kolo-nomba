import { useState } from "react";
import {
  ArrowLeft, ArrowRight, ArrowDownToLine, Plus, CheckCircle, Lock,
  Banknote, Landmark, FileText, Loader2,
} from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { Button } from "../../../components/shared/Button";
import { Input } from "../../../components/shared/Input";
import { PageHeader } from "../../../components/shared/PageHeader";
import { formatNaira } from "../../../utils/format";
import { usePayouts } from "../../../hooks/use-payouts";

export function GAPayouts() {
  const [step, setStep] = useState<"list" | "request" | "confirm" | "success">("list");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const { data: payouts, isLoading } = usePayouts();

  if (step === "request") return (
    <div>
      <button onClick={() => setStep("list")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Payouts
      </button>
      <div className="max-w-md">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Request Payout</h2>
        <Card className="p-5 mb-4">
          <p className="text-sm text-gray-500 dark:text-muted-foreground mb-1">Available Balance</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">—</p>
        </Card>
        <Input label="Payout Amount" placeholder="₦0.00" value={amount} onChange={setAmount} icon={Banknote} required />
        <Input label="Bank Account" placeholder="GTBank •••• 2841" value={bank} onChange={setBank} icon={Landmark} required />
        <Input label="Narration" placeholder="Monthly payout" onChange={() => {}} icon={FileText} />
        <Button full onClick={() => setStep("confirm")}><ArrowRight className="w-4 h-4" />Review Payout</Button>
      </div>
    </div>
  );

  if (step === "confirm") return (
    <div className="max-w-md">
      <button onClick={() => setStep("request")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-muted-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Confirm Payout</h2>
      <Card className="p-5 mb-4 space-y-3">
        {[["Amount", amount || "₦500,000"], ["Bank", bank || "GTBank •••• 2841"], ["Fee", "₦100"], ["You receive", amount || "₦499,900"]].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-muted-foreground">{k}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{v}</span>
          </div>
        ))}
      </Card>
      <Button full onClick={() => setStep("success")}><Lock className="w-4 h-4" />Confirm & Send</Button>
    </div>
  );

  if (step === "success") return (
    <div className="max-w-md text-center mx-auto">
      <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Payout initiated!</h2>
      <p className="text-gray-500 dark:text-muted-foreground mb-7">Your payout of <span className="font-semibold text-gray-900 dark:text-white">{amount || "₦500,000"}</span> is being processed.</p>
      <Button full onClick={() => setStep("list")}>Back to Payouts</Button>
    </div>
  );

  const payoutList = payouts || [];
  const totalPaid = payoutList.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <PageHeader title="Payout Management" subtitle="Request and track group payouts.">
        <Button size="sm" onClick={() => setStep("request")}><Plus className="w-4 h-4" />Request Payout</Button>
      </PageHeader>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <p className="text-sm text-gray-500 dark:text-muted-foreground mb-1">Available Balance</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">—</p>
          <Button className="mt-4" onClick={() => setStep("request")}><ArrowDownToLine className="w-4 h-4" />Request Payout</Button>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-500 dark:text-muted-foreground mb-1">Total Paid Out</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{formatNaira(totalPaid)}</p>
          <p className="text-xs text-gray-400 mt-2">Across {payoutList.length} payouts</p>
        </Card>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : payoutList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <p className="text-sm font-semibold">No payouts yet</p>
          <p className="text-xs mt-1">Payout history will show here once requested.</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-border">
            <p className="font-semibold text-gray-900 dark:text-white">Payout History</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-border">
                  {["Payout ID", "Recipient", "Amount", "Bank", "Status", "Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-border">
                {payoutList.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/3">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.recipientName}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{formatNaira(p.amount)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.bankName}</td>
                    <td className="px-4 py-3"><Badge status={p.status} /></td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.createdAt}</td>
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
