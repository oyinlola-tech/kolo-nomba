import { PiggyBank, Building2, Calendar, Wallet, Receipt, Loader2 } from "lucide-react";
import { Badge } from "../../../components/shared/Badge";
import { AccountNumberCard } from "../../../components/shared/AccountNumberCard";
import { useAuth } from "../../../hooks/use-auth";
import { useVirtualAccount, useCreateVirtualAccount } from "../../../hooks/use-virtual-account";
import { useCooperatives } from "../../../hooks/use-cooperatives";
import { useContributions } from "../../../hooks/use-contributions";
import { formatNaira } from "../../../utils/format";

import { useNavigate } from "react-router";

export function MHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: groups, isLoading: groupsLoading } = useCooperatives();
  const { data: contributions } = useContributions();
  const { data: virtualAccount, isLoading: vaLoading } = useVirtualAccount();
  const createVA = useCreateVirtualAccount();

  const totalContributed = (contributions || []).reduce((s, c) => s + (c.amount ?? 0), 0);
  const groupTotal = (groups || []).reduce((s, g) => s + (g.savingsBalance ?? 0), 0);
  const activeGroup = (groups || [])[0];

  const progressPercent = activeGroup && (activeGroup.savingsBalance ?? 0) > 0
    ? Math.min(100, Math.round(((activeGroup.savingsBalance ?? 0) / Math.max(1, (activeGroup.memberCount ?? 1) * (activeGroup.contributionAmount ?? 50000))) * 100))
    : 0;

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-5">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl px-5 pt-5 pb-8 mb-5">
        <p className="text-emerald-200 text-sm mb-0.5">Good morning,</p>
        <p className="text-white text-xl font-bold mb-5">{user?.firstName || "Member"} 👋</p>
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15">
          <p className="text-emerald-200 text-xs mb-1">Total Contributed</p>
          <p className="text-white text-3xl font-extrabold">{formatNaira(totalContributed)}</p>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-emerald-200 text-xs">Next Payment</p>
              <p className="text-white font-semibold text-sm">{activeGroup?.savingsBalance != null ? formatNaira(activeGroup.savingsBalance) : "—"}</p>
            </div>
            <button onClick={() => navigate("pay")} className="bg-white text-emerald-800 font-bold text-sm px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors">
              Pay Now
            </button>
          </div>
        </div>
      </div>
      <div className="mb-5">
        <AccountNumberCard
          accountNumber={virtualAccount?.accountNumber}
          accountName={virtualAccount?.accountName}
          bankName={virtualAccount?.bankName}
          loading={vaLoading}
          onGenerate={() => createVA.mutate()}
          generating={createVA.isPending}
        />
      </div>
      {activeGroup && (
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">My Active Group</p>
          <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{activeGroup.name}</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">{activeGroup.memberCount} members</p>
              </div>
              <Badge status={activeGroup.status} />
            </div>
            <div className="h-2 bg-gray-100 dark:bg-muted rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>{formatNaira(activeGroup.savingsBalance ?? 0)} collected</span>
              <span>{progressPercent}%</span>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border p-3 text-center">
          <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatNaira(totalContributed)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Contributed</p>
        </div>
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border p-3 text-center">
          <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatNaira(groupTotal)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Group Total</p>
        </div>
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border p-3 text-center">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
          <p className="text-sm font-bold text-gray-900 dark:text-white">—</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Next Payout</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("pay")} className="bg-primary text-white rounded-xl p-4 text-left hover:opacity-90 transition-opacity">
            <Wallet className="w-5 h-5 mb-2" />
            <p className="font-semibold text-sm">Pay Contribution</p>
            <p className="text-emerald-200 text-xs mt-0.5">Due —</p>
          </button>
          <button onClick={() => navigate("history")} className="bg-gray-50 dark:bg-muted border border-gray-100 dark:border-border rounded-xl p-4 text-left hover:bg-gray-100 dark:hover:bg-muted/80 transition-colors">
            <Receipt className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-2" />
            <p className="font-semibold text-sm text-gray-900 dark:text-white">View History</p>
            <p className="text-gray-400 text-xs mt-0.5">{(contributions || []).length} payments</p>
          </button>
        </div>
      </div>
    </div>
  );
}
