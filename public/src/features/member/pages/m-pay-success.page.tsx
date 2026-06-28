import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle, Download, Home } from "lucide-react";
import { apiClient } from "../../../api/client";

export function MPaySuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || "";

  const handleDownloadReceipt = async () => {
    try {
      const { data } = await apiClient.get(`/payments/receipt/${reference}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${reference}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      window.print();
    }
  };

  return (
    <div className="px-5 py-10 text-center flex flex-col items-center">
      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-5 ring-8 ring-emerald-50 dark:ring-emerald-900/10">
        <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
      <p className="text-gray-500 dark:text-muted-foreground text-sm mb-8">Your contribution has been received.</p>
      <div className="w-full bg-gray-50 dark:bg-muted border border-gray-100 dark:border-border rounded-2xl p-5 text-left mb-6">
        {[
          ["Reference", reference || "—"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 border-b border-gray-100 dark:border-border last:border-0 text-sm">
            <span className="text-gray-500 dark:text-muted-foreground">{k}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={handleDownloadReceipt} className="flex-1 py-3 border border-gray-200 dark:border-border rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-muted transition-colors">
          <Download className="w-4 h-4" />Receipt
        </button>
        <button onClick={() => navigate("/member/home")} className="flex-1 py-3 bg-primary rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <Home className="w-4 h-4" />Home
        </button>
      </div>
    </div>
  );
}
