import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Button } from "../../../components/shared/Button";
import { Input } from "../../../components/shared/Input";
import { PageHeader } from "../../../components/shared/PageHeader";
import { extractApiError } from "../../../utils/error";
import { createDispute } from "../../../services/dispute.service";
import { useQueryClient } from "@tanstack/react-query";

export function MDispute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await createDispute({ groupId: id!, issue: issue.trim(), amount: Number(amount) || 0 });
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      navigate(`/member/group/${id}`);
    } catch (err: unknown) {
      setError(extractApiError(err, "Failed to create dispute"));
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
      <PageHeader title="Create Dispute" subtitle="Report an issue regarding this group." />
      <Card className="p-5 max-w-xl space-y-4">
        <Input label="Issue Description" placeholder="Describe the dispute..." value={issue} onChange={setIssue} />
        <Input label="Amount (if applicable)" type="number" placeholder="₦0.00" value={amount} onChange={setAmount} />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button full onClick={handleSubmit} disabled={loading || !issue.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Submitting…" : "Submit Dispute"}
        </Button>
      </Card>
    </div>
  );
}
