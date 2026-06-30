import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Wallet, Loader2 } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Button } from "../../../components/shared/Button";
import { Input } from "../../../components/shared/Input";
import { PageHeader } from "../../../components/shared/PageHeader";
import { extractApiError } from "../../../utils/error";
import { createWithdrawal } from "../../../services/withdrawal.service";
import { useQueryClient } from "@tanstack/react-query";

export function MWithdraw() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await createWithdrawal({ groupId: id!, amount: Number(amount) || 0, destination: destination.trim() });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      navigate(`/member/group/${id}`);
    } catch (err: unknown) {
      setError(extractApiError(err, "Failed to request withdrawal"));
    } finally {
      setLoading(false);
    }
  };

  if (!id) return null;

  return (
    <div>
      <button onClick={() => navigate(`/member/group/${id}`)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-muted-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Group
      </button>
      <PageHeader title="Request Withdrawal" subtitle="Request funds from this group." />
      <Card className="p-5 max-w-xl space-y-4">
        <Input label="Amount" type="number" placeholder="₦0.00" value={amount} onChange={setAmount} icon={Wallet} />
        <Input label="Destination Account" placeholder="GTBank •••• 2841" value={destination} onChange={setDestination} />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button full onClick={handleSubmit} disabled={loading || !amount}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Submitting…" : "Request Withdrawal"}
        </Button>
      </Card>
    </div>
  );
}
