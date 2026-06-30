import { useParams, useNavigate } from "react-router";
import {
  Building2, ArrowLeft, Users, Calendar, Wallet, PiggyBank,
  Loader2, Clock, LogOut, FileText,
} from "lucide-react";
import { Badge } from "../../../components/shared/Badge";
import { Avatar } from "../../../components/shared/Avatar";
import { Button } from "../../../components/shared/Button";
import { formatNaira } from "../../../utils/format";
import { useCooperatives } from "../../../hooks/use-cooperatives";
import { usePayouts } from "../../../hooks/use-payouts";
import { useContributions } from "../../../hooks/use-contributions";
import { Card } from "../../../components/shared/Card";

export function MGroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: groupData, isLoading: groupsLoading } = useCooperatives();
  const groups = groupData?.items ?? [];
  const { data: payoutData, isLoading: payoutsLoading } = usePayouts();
  const payouts = payoutData?.items ?? [];
  const { data: contribData, isLoading: contribsLoading } = useContributions();
  const contributions = contribData?.items ?? [];

  const group = groups.find(g => g.id === id);
  const groupPayouts = payouts.filter(p => p.groupId === id).slice(0, 6);
  const groupContributions = contributions.slice(0, 8);

  const isLoading = groupsLoading || payoutsLoading || contribsLoading;

  if (isLoading) {
    return (
      <div className="px-4 md:px-6 py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-gray-500 mt-3">Loading group details...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="px-4 md:px-6 py-20 flex flex-col items-center justify-center text-gray-500 dark:text-muted-foreground">
        <Building2 className="w-10 h-10 mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-sm font-semibold">Group not found</p>
        <button onClick={() => navigate("/member/groups")} className="mt-4 text-sm text-primary font-medium hover:underline">
          Back to My Groups
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-5">
      <button onClick={() => navigate("/member/groups")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Groups
      </button>

      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl p-5 text-white mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-lg">{group.name}</h1>
            <p className="text-emerald-200 text-xs">Admin: {group.adminName}</p>
          </div>
          <Badge status={group.status} />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-emerald-200 text-[10px]">Savings</p>
            <p className="font-extrabold text-sm">{formatNaira(group.savingsBalance ?? 0)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-emerald-200 text-[10px]">Members</p>
            <p className="font-extrabold text-sm">{group.memberCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-emerald-200 text-[10px]">Created</p>
            <p className="font-extrabold text-sm">{group.createdAt}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <p className="font-semibold text-sm text-gray-900 dark:text-white">Payout Schedule</p>
          </div>
          {groupPayouts.length === 0 ? (
            <div className="py-4 text-center text-xs text-gray-500 dark:text-muted-foreground">
              <Clock className="w-5 h-5 mx-auto mb-1.5 text-gray-300 dark:text-gray-600" />
              <p>No payouts scheduled yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {groupPayouts.map(p => (
                <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.recipientName ?? ""} size="sm" />
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{p.recipientName}</p>
                      <p className="text-[10px] text-gray-400">{p.bankName ?? ""}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{formatNaira(p.amount)}</p>
                    <Badge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <p className="font-semibold text-sm text-gray-900 dark:text-white">Members ({group.memberCount})</p>
          </div>
          <div className="py-4 text-center text-xs text-gray-500 dark:text-muted-foreground">
            <Users className="w-5 h-5 mx-auto mb-1.5 text-gray-300 dark:text-gray-600" />
            <p>{group.memberCount} member{group.memberCount !== 1 ? "s" : ""} in this group</p>
          </div>
        </Card>
      </div>

      <Card className="p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <p className="font-semibold text-sm text-gray-900 dark:text-white">Group Actions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/member/group/${id}/withdraw`)}><Wallet className="w-3.5 h-3.5" />Request Withdrawal</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/member/group/${id}/dispute`)}><FileText className="w-3.5 h-3.5" />Create Dispute</Button>
          <Button variant="danger" size="sm" onClick={() => { if (confirm("Leave this group?")) navigate("/member/groups"); }}><LogOut className="w-3.5 h-3.5" />Leave Group</Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <p className="font-semibold text-sm text-gray-900 dark:text-white">Recent Contributions</p>
        </div>
        {groupContributions.length === 0 ? (
          <div className="py-4 text-center text-xs text-gray-500 dark:text-muted-foreground">
            <PiggyBank className="w-5 h-5 mx-auto mb-1.5 text-gray-300 dark:text-gray-600" />
            <p>No contributions recorded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {groupContributions.map(c => (
              <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-border last:border-0">
                <div className="flex items-center gap-2">
                   <Avatar name={c.memberName ?? ""} size="sm" />
                   <p className="text-xs font-medium text-gray-900 dark:text-white">{c.memberName ?? ""}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                   <p className="text-xs font-bold text-gray-900 dark:text-white">{formatNaira(c.amount ?? 0)}</p>
                  <Badge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
