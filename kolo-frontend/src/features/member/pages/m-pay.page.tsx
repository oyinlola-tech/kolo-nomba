import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  X, Landmark, CreditCard, ShieldCheck, Lock, RefreshCw, Loader2, Copy, CheckCircle, ArrowLeft,
} from "lucide-react";
import { useCreatePayment } from "../../../hooks/use-payments";
import { usePaymentStatus } from "../../../hooks/use-payment-status";
import { useContribution } from "../../../hooks/use-contributions";
import { usePaymentPolling } from "../../../hooks/use-payment-polling";
import { formatNaira } from "../../../utils/format";
import { extractApiError } from "../../../utils/error";

function BankTransferInfoDisplay({ info, onBack, paymentId, onConfirmed, onViewHistory }: { info: { accountNumber: string; accountName: string; bankName: string; amount: number }; onBack: () => void; paymentId: string | null; onConfirmed: () => void; onViewHistory: () => void }) {
  const [copied, setCopied] = useState(false);
  const { data: paymentStatus } = usePaymentStatus(paymentId, !!paymentId);

  usePaymentPolling(!paymentStatus || paymentStatus.status === "pending" || paymentStatus.status === "processing");

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isConfirmed = paymentStatus && (paymentStatus.status === "paid" || paymentStatus.status === "success");

  useEffect(() => {
    if (isConfirmed) onConfirmed();
  }, [isConfirmed]);

  if (isConfirmed) {
    return (
      <div className="px-5 py-5">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-50 dark:ring-emerald-900/10">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">Payment Confirmed!</p>
          <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6">Your bank transfer has been received.</p>
          <button onClick={onViewHistory}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
            View History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-5 py-5">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted text-gray-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <p className="font-bold text-gray-900 dark:text-white">Bank Transfer</p>
      </div>
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-5 text-white mb-4">
        <p className="text-blue-200 text-xs mb-1">Transfer to this account</p>
        <p className="text-2xl lg:text-3xl font-extrabold tracking-wider mb-1">{info.accountNumber}</p>
        <button onClick={() => handleCopy(info.accountNumber)}
          className="flex items-center gap-1.5 text-blue-200 text-xs hover:text-white mb-3 transition-colors">
          {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy account number"}
        </button>
        <div className="border-t border-white/20 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-200/80">Bank</span>
            <span className="font-semibold">{info.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200/80">Account Name</span>
            <span className="font-semibold">{info.accountName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200/80">Amount</span>
            <span className="font-semibold">{formatNaira(info.amount)}</span>
          </div>
        </div>
      </div>
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400">
        <p className="font-semibold mb-1 text-xs">Instructions:</p>
        <ol className="list-decimal list-inside space-y-1 text-[11px]">
          <li>Open your banking app</li>
          <li>Transfer the exact amount shown above to the account details</li>
          <li>Use your account name as the transfer reference</li>
          <li>Your payment will be confirmed automatically</li>
        </ol>
      </div>
      <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
        <RefreshCw className="w-3 h-3 animate-spin" />
        Awaiting payment confirmation… this page refreshes automatically.
      </div>
    </div>
  );
}

function BankTransferInit({ contributionId, onReady, onBack }: { amount: number; contributionId: string | null; onReady: (info: { accountNumber: string; accountName: string; bankName: string; amount: number; paymentId: string | null }) => void; onBack: () => void }) {
  const createPayment = useCreatePayment();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!contributionId) return;
    setLoading(true);
    setError("");
    try {
      const result = await createPayment.mutateAsync({
        contributionId,
        paymentMethod: "bank_transfer",
      });
      if (result.virtualAccount) {
        onReady({ ...result.virtualAccount, paymentId: result.paymentId });
      } else {
        setError("Failed to generate account number. Please try again.");
      }
    } catch {
      setError("Failed to generate account number. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-5 py-5">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted text-gray-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <p className="font-bold text-gray-900 dark:text-white">Bank Transfer</p>
      </div>
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 text-white text-center">
        <Landmark className="w-10 h-10 mx-auto mb-3" />
        <p className="font-bold mb-2">Generate Your Account</p>
        <p className="text-blue-200 text-sm mb-4">Get a dedicated account number to make bank transfer payments.</p>
        {error && <p className="text-red-300 text-xs mb-3">{error}</p>}
        <button onClick={handleGenerate} disabled={loading}
          className="w-full py-3 bg-white text-blue-800 font-bold rounded-xl text-sm hover:bg-blue-50 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Generating..." : "Generate Account Number"}
        </button>
      </div>
    </div>
  );
}

export function MPay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contributionId = searchParams.get("contributionId");
  const { data: contribution, isLoading: contributionLoading } = useContribution(contributionId);
  const createPayment = useCreatePayment();
  const [method, setMethod] = useState<"card" | "bank">("card");
  const [error, setError] = useState("");
  const [bankTransferInfo, setBankTransferInfo] = useState<{
    accountNumber: string;
    accountName: string;
    bankName: string;
    amount: number;
    paymentId: string | null;
  } | null>(null);

  const amount = contribution?.expectedAmount ?? 0;

  usePaymentPolling(method === "bank" && !!bankTransferInfo);

  if (method === "bank") {
    if (bankTransferInfo) {
      return <BankTransferInfoDisplay info={bankTransferInfo} onBack={() => { setMethod("card"); setBankTransferInfo(null); }} paymentId={bankTransferInfo.paymentId} onConfirmed={() => { setMethod("card"); setBankTransferInfo(null); }} onViewHistory={() => navigate("/member/history")} />;
    }
    return <BankTransferInit amount={amount} contributionId={contributionId}
      onReady={(info) => setBankTransferInfo(info)}
      onBack={() => setMethod("card")} />;
  }

  const methods = [
    { id: "card" as const, icon: CreditCard, title: "Debit / Credit Card", sub: "Visa, Mastercard, Verve" },
    { id: "bank" as const, icon: Landmark, title: "Bank Transfer", sub: "Send to virtual account" },
  ];

  const handlePay = async () => {
    setError("");
    if (!contributionId) {
      setError("No contribution selected");
      return;
    }
    try {
      const result = await createPayment.mutateAsync({
        contributionId,
        paymentMethod: "card",
      });
      if (result.checkoutUrl) {
        navigate(result.checkoutUrl);
      } else {
        navigate(`pay-success?reference=${result.reference}&paymentId=${result.paymentId}`);
      }
    } catch (err: unknown) {
      setError(extractApiError(err, "Payment failed. Please try again."));
    }
  };

  if (contributionLoading) {
    return (
      <div className="px-5 py-5">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("home")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted text-gray-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <p className="font-bold text-gray-900 dark:text-white">Pay Contribution</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-5 lg:px-6 py-4 lg:py-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("home")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted text-gray-500 transition-colors">
          <X className="w-4 h-4" />
        </button>
        <p className="font-bold text-gray-900 dark:text-white">Pay Contribution</p>
      </div>

      <div className="bg-gray-50 dark:bg-muted border border-gray-100 dark:border-border rounded-2xl p-5 lg:p-6 text-center mb-5">
        <p className="text-[10px] font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-widest mb-2">Total Amount Due</p>
        <p className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">{formatNaira(amount)}</p>
        <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-3 h-3" />Secure Payment
        </div>
      </div>

      <p className="text-xs font-semibold text-gray-400 dark:text-muted-foreground uppercase tracking-wider mb-3">Select Payment Method</p>
      <div className="space-y-2 mb-6">
        {methods.map(m => (
          <button key={m.id} onClick={() => setMethod(m.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl lg:rounded-2xl border-2 transition-all ${
              method === m.id
                ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10"
                : "border-gray-100 dark:border-border bg-white dark:bg-card hover:border-gray-200 dark:hover:border-border/80"
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              method === m.id
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 dark:bg-muted text-gray-400"
            }`}>
              <m.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <p className={`text-sm font-semibold ${method === m.id ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                {m.title}
              </p>
              <p className="text-[11px] text-gray-400">{m.sub}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              method === m.id ? "border-emerald-600" : "border-gray-300 dark:border-gray-600"
            }`}>
              {method === m.id && <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />}
            </div>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <button onClick={handlePay} disabled={createPayment.isPending || !contributionId}
        className="w-full py-3.5 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm rounded-xl lg:rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
        {createPayment.isPending ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
        {createPayment.isPending ? "Processing…" : `Pay ${formatNaira(amount)} Now`}
      </button>

      {error && (
        <button onClick={handlePay} disabled={createPayment.isPending || !contributionId}
          className="w-full py-3 mt-2 border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold text-sm rounded-xl lg:rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-red-50 dark:hover:bg-red-900/10">
          <RefreshCw className="w-4 h-4" />
          Retry Payment
        </button>
      )}

      <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" />Secured by Nomba Checkout
      </p>
    </div>
  );
}
