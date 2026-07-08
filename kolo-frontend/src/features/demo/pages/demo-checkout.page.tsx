import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  CreditCard, Check, RefreshCw, ShieldCheck, X, Clock, Lock, Smartphone,
} from "lucide-react";
import { Button } from "../../../components/shared/Button";
import { Logo } from "../../../components/shared/Logo";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { DEMO_OTP_CODES } from "../data/demo-data";
import { completePayment } from "../store/demo-store";

type Step = "form" | "processing" | "otp" | "success";

export function DemoCheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("paymentId") ?? "";
  const reference = searchParams.get("reference") ?? "";
  const amount = searchParams.get("amount") ?? "50000";
  const groupName = searchParams.get("group") ?? "Market Traders Ajo";

  const [step, setStep] = useState<Step>("form");
  const [cardNumber] = useState("4084 0812 3456 7890");
  const [cardName] = useState("Adaobi Okonkwo");
  const [expiry] = useState("12/27");
  const [cvv] = useState("123");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const maskCard = (num: string) => {
    const digits = num.replace(/\s/g, "");
    return `${digits.slice(0, 4)} ${"•".repeat(4)} ${"•".repeat(4)} ${digits.slice(-4)}`;
  };

  const handlePayNow = () => {
    setStep("processing");
    setTimeout(() => setStep("otp"), 2000);
  };

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) document.getElementById(`checkout-otp-${i + 1}`)?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      document.getElementById(`checkout-otp-${i - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    const match = DEMO_OTP_CODES.find((c) => c.code === code);
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1000));

    if (!match || match.result === "wrong") {
      setOtpError("Invalid OTP. Please check and try again.");
      setVerifying(false);
      return;
    }
    if (match.result === "expired") {
      setOtpError("This OTP has expired. A new one has been sent.");
      setVerifying(false);
      return;
    }

    if (paymentId) completePayment(paymentId);
    setStep("success");
    setVerifying(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
      {/* Minimal header */}
      <div className="bg-white dark:bg-card border-b border-gray-100 dark:border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-xs text-gray-400 font-mono border border-gray-200 dark:border-border rounded px-1.5 py-0.5">DEMO</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="text-xs text-gray-400">Secured by <span className="font-semibold text-gray-600 dark:text-gray-300">Nomba</span></span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Step 1: Card form */}
          {step === "form" && (
            <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold">Pay with Card</span>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Demo Mode</span>
                </div>
                <p className="text-3xl font-extrabold mb-1">₦{parseInt(amount).toLocaleString()}</p>
                <p className="text-emerald-200 text-xs">{groupName}</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-xs text-emerald-200 mb-1">Card number</p>
                  <p className="text-lg font-mono tracking-wider">{maskCard(cardNumber)}</p>
                </div>
                <div className="flex gap-4 mt-3 text-xs">
                  <div>
                    <p className="text-emerald-200">Expiry</p>
                    <p className="font-semibold font-mono">{expiry}</p>
                  </div>
                  <div>
                    <p className="text-emerald-200">CVV</p>
                    <p className="font-semibold font-mono">{cvv}</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-1.5 block">Cardholder Name</label>
                  <div className="px-3 py-2.5 bg-gray-50 dark:bg-muted rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-border">
                    {cardName}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-1.5 block">Card Number</label>
                  <div className="px-3 py-2.5 bg-gray-50 dark:bg-muted rounded-xl text-sm font-mono text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-border">
                    {cardNumber}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-1.5 block">Expiry Date</label>
                    <div className="px-3 py-2.5 bg-gray-50 dark:bg-muted rounded-xl text-sm font-mono text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-border">
                      {expiry}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-1.5 block">CVV</label>
                    <div className="px-3 py-2.5 bg-gray-50 dark:bg-muted rounded-xl text-sm font-mono text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-border">
                      {cvv}
                    </div>
                  </div>
                </div>
                <Button full size="lg" onClick={handlePayNow}>
                  <Lock className="w-4 h-4" />
                  Pay ₦{parseInt(amount).toLocaleString()}
                </Button>
                <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" />Secured by Nomba Payment Gateway
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Processing */}
          {step === "processing" && (
            <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Processing Payment</h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground">Please don&apos;t close this page&hellip;</p>
              <p className="text-xs text-gray-400 mt-4">₦{parseInt(amount).toLocaleString()} to {groupName}</p>
            </div>
          )}

          {/* Step 3: OTP */}
          {step === "otp" && (
            <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Smartphone className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1 text-center">
                Card Verification
              </h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-2 text-center">
                Enter the OTP sent to your registered phone
              </p>
              <p className="text-xs text-gray-400 text-center mb-6">
                (Demo: use sample codes below)
              </p>

              {otpError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl mb-5 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                  <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="flex gap-2.5 justify-center mb-6">
                {otp.map((d, i) => (
                  <input key={i} id={`checkout-otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-13 text-center text-lg font-bold border-2 border-gray-200 dark:border-border rounded-xl focus:outline-none focus:border-primary dark:bg-input-background dark:text-white transition-all" />
                ))}
              </div>

              <Button full onClick={handleVerify} disabled={verifying || otp.some((d) => !d)} className="mb-5">
                {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {verifying ? "Verifying\u2026" : "Verify OTP"}
              </Button>

              <div className="bg-gray-50 dark:bg-muted rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Sample OTP codes
                </p>
                <div className="space-y-1.5">
                  {DEMO_OTP_CODES.map((c) => (
                    <div key={c.code} className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{c.code}</span>
                      <span className={`${c.result === "success" ? "text-emerald-600 dark:text-emerald-400" : c.result === "wrong" ? "text-red-500" : "text-amber-600 dark:text-amber-400"}`}>
                        {c.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-1">
                ₦{parseInt(amount).toLocaleString()} paid to {groupName}
              </p>
              <p className="text-xs text-gray-400 mb-6">Reference: {reference || "KOLO-DEMO-REF"}</p>
              <Button full onClick={() => navigate("/member/pay-success?reference=" + reference + "&paymentId=" + paymentId)}>
                Continue
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-card border-t border-gray-100 dark:border-border px-4 py-3 text-center">
        <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3 h-3" />
          Demo Mode — No real transaction will be processed
          <Clock className="w-3 h-3 ml-1" />
        </p>
      </div>
    </div>
  );
}
