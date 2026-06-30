import { useState } from "react";
import { Landmark, Copy, CheckCircle, Loader2 } from "lucide-react";

interface AccountNumberCardProps {
  accountNumber: string | null | undefined;
  accountName: string | null | undefined;
  bankName: string | null | undefined;
  loading?: boolean;
  onGenerate?: () => void;
  generating?: boolean;
}

export function AccountNumberCard({ accountNumber, accountName, bankName, loading, onGenerate, generating }: AccountNumberCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!accountNumber) return;
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = accountNumber;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (!accountNumber && onGenerate) {
    return (
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
          <p className="font-bold text-sm">Your Bank Account</p>
        </div>
        <p className="text-blue-200 text-xs mb-4">Get a dedicated account number for easy bank transfers.</p>
        <button onClick={onGenerate} disabled={generating} className="w-full py-3 bg-white text-blue-800 font-bold rounded-xl text-sm hover:bg-blue-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {generating ? "Generating…" : "Generate Account Number"}
        </button>
      </div>
    );
  }

  if (!accountNumber) return null;

  return (
    <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-5 text-white">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <p className="text-blue-200 text-xs">Your Dedicated Account</p>
          <p className="font-bold text-sm">{bankName || "Nomba Bank"}</p>
        </div>
      </div>
      <p className="text-blue-200 text-xs mb-1">Account Number</p>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-3xl font-extrabold tracking-wider">{accountNumber}</p>
        <button onClick={handleCopy} className="p-2 bg-white/15 rounded-lg hover:bg-white/25 transition-colors" title="Copy account number">
          {copied ? <CheckCircle className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <p className="text-blue-200 text-xs">Account Name: <span className="text-white font-semibold">{accountName || "—"}</span></p>
    </div>
  );
}
