import { useParams, useNavigate } from "react-router";
import {
  Building2, ArrowLeft, Users, Calendar, Wallet, PiggyBank,
  Loader2, Clock, LogOut, FileText, TrendingUp,
} from "lucide-react";
import { Badge } from "../../../components/shared/Badge";
import { Avatar } from "../../../components/shared/Avatar";
import { Button } from "../../../components/shared/Button";
import { formatNaira } from "../../../utils/format";
import { useCooperatives } from "../../../hooks/use-cooperatives";
import { usePayouts } from "../../../hooks/use-payouts";
import { useContributions } from "../../../hooks/use-contributions";

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
      <div className="px-4 md:px-6 lg:px-5 py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-gray-500 mt-3">Loading group details...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="px-4 md:px-6 lg:px-5 py-20 flex flex-col items-center justify-center text-gray-500 dark:text-muted-foreground">
        <Building2 className="w-10 h-10 mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-sm font-semibold">Group not found</p>
        <button onClick={() => navigate("/member/groups")} className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
          Back to My Groups
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-5 lg:px-6 py-4 lg:py-5 space-y-4 lg:space-y-5">

      {/* Back + Header */}
      <div>
        <button onClick={() => navigate("/member/groups")} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Groups
        </button>
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 rounded-2xl lg:rounded-3xl p-5 lg:p-6 text-white relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg lg:text-xl truncate">{group.name}</h1>
              <p className="text-emerald-200/80 text-xs">Admin: {group.adminName}</p>
            </div>
            <Badge status={group.status} />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Savings", value: formatNaira(group.savingsBalance ?? 0) },
              { label: "Members", value: String(group.memberCount) },
              { label: "Created", value: group.createdAt ? new Date(group.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" }) : "—" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/5">
                <p className="text-emerald-200/70 text-[10px] font-medium">{s.label}</p>
                <p className="font-extrabold text-sm lg:text-base mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-5">

        {/* Payout Schedule */}
        <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">Payout Schedule</p>
          </div>
          {groupPayouts.length === 0 ? (
            <div className="py-6 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-xs text-gray-400 dark:text-muted-foreground font-medium">No payouts scheduled</p>
              <p className="text-[10px] text-gray-300 dark:text-gray-500 mt-0.5">Payouts appear here once scheduled</p>
            </div>
          ) : (
            <div className="space-y-2">
              {groupPayouts.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={p.recipientName ?? ""} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{p.recipientName || "—"}</p>
                      <p className="text-[10px] text-gray-400 truncate">{p.bankName ?? ""}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{formatNaira(p.amount)}</p>
                    <Badge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members List */}
        <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">Members ({group.memberCount})</p>
          </div>
          {group.memberCount > 0 ? (
            <div className="space-y-1.5">
              {Array.from({ length: Math.min(group.memberCount, 8) }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-muted/30 transition-colors">
                  <Avatar name={`Member ${i + 1}`} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">Member {i + 1}</p>
                    <p className="text-[10px] text-gray-400 truncate">member{i + 1}@email.com</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
                  </div>
                </div>
              ))}
              {group.memberCount > 8 && (
                <button className="w-full text-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-xl transition-colors">
                  View all {group.memberCount} members
                </button>
              )}
            </div>
          ) : (
            <div className="py-6 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-xs text-gray-400 dark:text-muted-foreground font-medium">No members yet</p>
            </div>
          )}
        </div>

      </div>

      {/* Group Actions */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="font-semibold text-sm text-gray-900 dark:text-white">Group Actions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/member/group/${id}/withdraw`)}>
            <Wallet className="w-3.5 h-3.5" />Request Withdrawal
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/member/group/${id}/dispute`)}>
            <FileText className="w-3.5 h-3.5" />Create Dispute
          </Button>
          <Button variant="danger" size="sm" onClick={() => { if (confirm("Leave this group?")) navigate("/member/groups"); }}>
            <LogOut className="w-3.5 h-3.5" />Leave Group
          </Button>
        </div>
      </div>

      {/* Recent Contributions */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="font-semibold text-sm text-gray-900 dark:text-white">Recent Contributions</p>
        </div>
        {groupContributions.length === 0 ? (
          <div className="py-6 text-center">
            <PiggyBank className="w-6 h-6 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-xs text-gray-400 dark:text-muted-foreground font-medium">No contributions yet</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {groupContributions.map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={c.memberName ?? ""} size="sm" />
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{c.memberName || "—"}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <p className="text-xs font-extrabold text-gray-900 dark:text-white">{formatNaira(c.amount ?? 0)}</p>
                  <Badge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
