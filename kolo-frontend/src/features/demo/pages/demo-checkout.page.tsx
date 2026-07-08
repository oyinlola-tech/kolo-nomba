import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  CreditCard, Check, RefreshCw, ShieldCheck, X, Clock, Lock, Smartphone, ChevronDown,
} from "lucide-react";
import { Button } from "../../../components/shared/Button";
import { Logo } from "../../../components/shared/Logo";
import { ThemeToggle } from "../../../components/shared/ThemeToggle";
import { DEMO_OTP_CODES, DEMO_PAYMENT_CARDS } from "../data/demo-data";
import type { DemoPaymentCard } from "../data/demo-data";
import { completePayment } from "../store/demo-store";

type Step = "form" | "processing" | "otp" | "success";

function CardVisual({ card, mini }: { card: DemoPaymentCard; mini?: boolean }) {
  return (
    <div className={`relative bg-gradient-to-br ${card.gradient} ${mini ? "rounded-xl p-3 h-[100px]" : "rounded-2xl p-5 h-[200px]"} text-white shadow-xl flex flex-col justify-between overflow-hidden flex-shrink-0`}>
      <div className="absolute top-2 right-2 w-16 h-16 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full blur-2xl" />
      <div className="flex items-start justify-between relative z-10">
        <span className={`${mini ? "text-[7px]" : "text-[10px]"} text-emerald-200/80 font-medium tracking-wider`}>KOLO</span>
        <span className={`${mini ? "text-[8px]" : "text-[10px]"} font-semibold text-white/80 tracking-wider`}>{card.network}</span>
      </div>
      <div className="relative z-10">
        <p className={`${mini ? "text-xs tracking-[2px]" : "text-lg tracking-[4px]"} font-mono`}>{mini ? `**** **** **** ${card.number.slice(-4)}` : card.number}</p>
        {!mini && (
          <div className="flex gap-6 mt-3">
            <div>
              <p className="text-[9px] text-white/60 tracking-wider">EXPIRY</p>
              <p className="text-xs font-mono font-semibold">{card.expiry}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/60 tracking-wider">CVV</p>
              <p className="text-xs font-mono font-semibold">{card.cvv}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DemoCheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("paymentId") ?? "";
  const reference = searchParams.get("reference") ?? "";
  const amount = searchParams.get("amount") ?? "50000";
  const groupName = searchParams.get("group") ?? "Market Traders Ajo";

  const [step, setStep] = useState<Step>("form");
  const [selectedCardId, setSelectedCardId] = useState(DEMO_PAYMENT_CARDS[0].id);
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const selectedCard = DEMO_PAYMENT_CARDS.find((c) => c.id === selectedCardId) ?? DEMO_PAYMENT_CARDS[0];

  const maskCard = (num: string) => {
    const digits = num.replace(/\s/g, "");
    return `${digits.slice(0, 4)} **** **** ${digits.slice(-4)}`;
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
          {step === "form" && (
            <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold">Pay with Card</span>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Demo Mode</span>
                </div>
                <p className="text-3xl font-extrabold mb-1">N{parseInt(amount).toLocaleString()}</p>
                <p className="text-emerald-200 text-xs">{groupName}</p>
              </div>

              <div className="p-5 space-y-4">
                {/* Card selector */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-2 block">Test Card</label>
                  <button onClick={() => setShowCardPicker(!showCardPicker)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-xl hover:bg-gray-100 dark:hover:bg-muted/70 transition-colors">
                    <CardVisual card={selectedCard} mini />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{maskCard(selectedCard.number)}</p>
                      <p className={`text-xs font-medium ${
                        selectedCard.result === "success" ? "text-emerald-600" :
                        selectedCard.result === "wrong" ? "text-red-500" : "text-amber-600"
                      }`}>
                        {selectedCard.description}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${showCardPicker ? "rotate-180" : ""}`} />
                  </button>

                  {showCardPicker && (
                    <div className="mt-2 space-y-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl p-2">
                      {DEMO_PAYMENT_CARDS.map((card) => (
                        <button key={card.id} onClick={() => { setSelectedCardId(card.id); setShowCardPicker(false); }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                            card.id === selectedCardId
                              ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                              : "hover:bg-gray-50 dark:hover:bg-muted border border-transparent"
                          }`}>
                          <CardVisual card={card} mini />
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{card.number}</p>
                            <p className={`text-[10px] ${
                              card.result === "success" ? "text-emerald-600" :
                              card.result === "wrong" ? "text-red-500" : "text-amber-600"
                            }`}>
                              OTP {card.otpToUse} &mdash; {card.result === "success" ? "Success" : card.result === "wrong" ? "Wrong OTP" : "Expired"}
                            </p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            card.id === selectedCardId ? "border-emerald-600" : "border-gray-300"
                          }`}>
                            {card.id === selectedCardId && <div className="w-2 h-2 bg-emerald-600 rounded-full" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-1.5 block">Cardholder Name</label>
                  <div className="px-3 py-2.5 bg-gray-50 dark:bg-muted rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-border">
                    Adaobi Okonkwo
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-1.5 block">Expiry Date</label>
                    <div className="px-3 py-2.5 bg-gray-50 dark:bg-muted rounded-xl text-sm font-mono text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-border">
                      {selectedCard.expiry}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-1.5 block">CVV</label>
                    <div className="px-3 py-2.5 bg-gray-50 dark:bg-muted rounded-xl text-sm font-mono text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-border">
                      {selectedCard.cvv}
                    </div>
                  </div>
                </div>

                <Button full size="lg" onClick={handlePayNow}>
                  <Lock className="w-4 h-4" />
                  Pay N{parseInt(amount).toLocaleString()} Now
                </Button>
                <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" />Secured by Nomba Payment Gateway
                </p>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Processing Payment</h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground">Please don&apos;t close this page...</p>
              <p className="text-xs text-gray-400 mt-4">N{parseInt(amount).toLocaleString()} to {groupName}</p>
            </div>
          )}

          {step === "otp" && (
            <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Smartphone className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1 text-center">
                Card Verification
              </h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground text-center mb-1">
                Enter the OTP sent to your registered phone
              </p>
              <p className="text-xs text-gray-400 text-center mb-6">
                Using card ending in {selectedCard.number.slice(-4)} &mdash; use sample codes below
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
                {verifying ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="bg-gray-50 dark:bg-muted rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Sample OTP codes
                </p>
                <div className="grid gap-2">
                  {DEMO_OTP_CODES.map((c) => (
                    <div key={c.code} className="flex items-center justify-between text-xs bg-white dark:bg-card rounded-lg px-3 py-2 border border-gray-100 dark:border-border">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          c.result === "success" ? "bg-emerald-500" :
                          c.result === "wrong" ? "bg-red-500" : "bg-amber-500"
                        }`} />
                        <span className="font-mono font-bold text-gray-900 dark:text-white">{c.code}</span>
                      </div>
                      <span className={`text-[11px] ${
                        c.result === "success" ? "text-emerald-600 dark:text-emerald-400" :
                        c.result === "wrong" ? "text-red-500" : "text-amber-600 dark:text-amber-400"
                      }`}>
                        {c.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50 dark:ring-emerald-900/10">
                <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-1">
                N{parseInt(amount).toLocaleString()} paid to {groupName}
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
          Demo Mode &mdash; No real transaction will be processed
          <Clock className="w-3 h-3 ml-1" />
        </p>
      </div>
    </div>
  );
}