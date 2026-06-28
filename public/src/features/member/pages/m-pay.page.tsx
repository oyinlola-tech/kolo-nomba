import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  X, Wallet, Landmark, CreditCard, ShieldCheck, Lock, RefreshCw,
} from "lucide-react";
import { useCreatePayment } from "../../../hooks/use-payments";

export function MPay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contributionId = searchParams.get("contributionId");
  const createPayment = useCreatePayment();
  const [method, setMethod] = useState<"wallet" | "bank" | "card">("wallet");
  const [error, setError] = useState("");

  const methods = [
    { id: "wallet" as const, icon: Wallet, title: "Nomba Wallet", sub: "Pay with wallet balance", color: "bg-emerald-600" },
    { id: "bank" as const, icon: Landmark, title: "Bank Transfer", sub: "Send to virtual account", color: "bg-gray-500" },
    { id: "card" as const, icon: CreditCard, title: "Debit / Credit Card", sub: "Visa, Mastercard, Verve", color: "bg-gray-500" },
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
        amount: 50000,
        paymentMethod: method,
      });
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        navigate(`pay-success?reference=${result.reference}&paymentId=${result.paymentId}`);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Payment failed. Please try again.";
      setError(msg);
    }
  };

  return (
    <div className="px-5 py-5">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("home")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted text-gray-500 transition-colors">
          <X className="w-4 h-4" />
        </button>
        <p className="font-bold text-gray-900 dark:text-white">Pay Contribution</p>
      </div>
      <div className="bg-gray-50 dark:bg-muted border border-gray-100 dark:border-border rounded-2xl p-6 text-center mb-6">
        <p className="text-xs font-semibold text-gray-500 dark:text-muted-foreground tracking-widest mb-2">TOTAL AMOUNT DUE</p>
        <p className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">₦50,000</p>
        <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-3 h-3" />Secure Payment Link
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Select Payment Method</p>
      <div className="space-y-2 mb-8">
        {methods.map(m => (
          <button key={m.id} onClick={() => setMethod(m.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${method === m.id ? "border-primary bg-emerald-50/50 dark:bg-emerald-900/10" : "border-gray-100 dark:border-border bg-white dark:bg-card hover:border-gray-200"}`}>
            <div className={`w-10 h-10 ${m.id === method ? "bg-emerald-600" : "bg-gray-200 dark:bg-muted"} rounded-full flex items-center justify-center flex-shrink-0 transition-colors`}>
              <m.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className={`text-sm font-semibold ${method === m.id ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>{m.title}</p>
              <p className="text-xs text-gray-400">{m.sub}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === m.id ? "border-primary" : "border-gray-300 dark:border-gray-600"}`}>
              {method === m.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
            </div>
          </button>
        ))}
      </div>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}
      <button onClick={handlePay} disabled={createPayment.isPending}
        className="w-full py-4 bg-primary hover:opacity-90 disabled:opacity-60 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
        {createPayment.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
        {createPayment.isPending ? "Processing…" : "Pay ₦50,000 Now"}
      </button>
      <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" />Secured by Nomba Checkout
      </p>
    </div>
  );
}
