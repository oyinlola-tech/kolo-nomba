import { PiggyBank, Building2, Calendar, Wallet, Receipt, Loader2, TrendingUp, ArrowRight, ChevronRight, Clock, ShieldCheck } from "lucide-react";
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
  const { data: groupData, isLoading: groupsLoading } = useCooperatives();
  const groups = groupData?.items ?? [];
  const { data: contribData } = useContributions();
  const contributions = contribData?.items ?? [];
  const { data: virtualAccount, isLoading: vaLoading } = useVirtualAccount();
  const createVA = useCreateVirtualAccount();

  const totalContributed = contributions.reduce((s, c) => s + (c.amount ?? 0), 0);
  const groupTotal = groups.reduce((s, g) => s + (g.savingsBalance ?? 0), 0);
  const activeGroup = groups[0];
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  const progressPercent = activeGroup && (activeGroup.savingsBalance ?? 0) > 0
    ? Math.min(100, Math.round(((activeGroup.savingsBalance ?? 0) / Math.max(1, (activeGroup.memberCount ?? 1) * (activeGroup.contributionAmount ?? 50000))) * 100))
    : 0;

  const recentPayments = contributions.slice(-3).reverse();
  const onTimeCount = contributions.filter(c => c.status === "paid" || c.status === "completed").length;
  const lateCount = contributions.filter(c => c.status === "late" || c.status === "overdue").length;

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-5 lg:px-6 py-4 lg:py-5 space-y-5">

      {/* Greeting Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 rounded-2xl lg:rounded-3xl px-5 lg:px-7 pt-5 lg:pt-6 pb-6 lg:pb-7">
        <div className="absolute -top-6 -right-6 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-emerald-400/5 rounded-full blur-3xl" />
        <p className="text-emerald-200/80 text-xs sm:text-sm font-medium tracking-wide">{greeting}</p>
        <p className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mt-0.5">{user?.firstName || "Member"}</p>
        <div className="mt-4 lg:mt-5 bg-white/10 backdrop-blur-lg rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-200/80 text-xs font-medium">Total Contributed</span>
            <span className="text-emerald-300/60 text-[10px]">All time</span>
          </div>
          <p className="text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">{formatNaira(totalContributed)}</p>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-200/70 text-xs">
                {activeGroup ? `Next: ${formatNaira(activeGroup.contributionAmount ?? 0)}` : "No active group"}
              </span>
            </div>
            <button onClick={() => navigate("pay")}
              className="bg-white text-emerald-800 text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-emerald-50 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              Pay Now
            </button>
          </div>
        </div>
      </div>

      {/* Account Card */}
      <AccountNumberCard
        accountNumber={virtualAccount?.accountNumber}
        accountName={virtualAccount?.accountName}
        bankName={virtualAccount?.bankName}
        loading={vaLoading}
        onGenerate={() => createVA.mutate()}
        generating={createVA.isPending}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {[
          { icon: PiggyBank, label: "Contributed", value: formatNaira(totalContributed) },
          { icon: Building2, label: "Group Total", value: formatNaira(groupTotal) },
          { icon: Calendar, label: "Next Payout", value: "—" },
        ].map(({ icon: I, label, value }) => (
          <div key={label} className="bg-white dark:bg-card rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-border p-3 lg:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2 lg:mb-3">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg lg:rounded-xl flex items-center justify-center">
                <I className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-base lg:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</p>
            <p className="text-[10px] lg:text-xs text-gray-400 dark:text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Active Group + Payment Health */}
      {activeGroup && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{activeGroup.name}</p>
                  <p className="text-[10px] text-gray-400">{activeGroup.memberCount} member{activeGroup.memberCount !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <Badge status={activeGroup.status} />
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-muted rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500 dark:text-muted-foreground">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatNaira(activeGroup.savingsBalance ?? 0)}</span> collected
              </span>
              <span className="text-gray-400 font-medium">{progressPercent}%</span>
            </div>
            <button onClick={() => navigate("groups")} className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 py-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
              View Group Details <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">Payment Health</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-3">
                <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{onTimeCount}</p>
                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">On time</p>
              </div>
              <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-3">
                <p className="text-lg font-extrabold text-amber-700 dark:text-amber-300">{lateCount}</p>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">Late</p>
              </div>
            </div>
            {totalContributed > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-50 dark:border-border/50 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] text-gray-400 dark:text-muted-foreground">
                  {recentPayments.length > 0 ? `${recentPayments.length} recent payment${recentPayments.length !== 1 ? "s" : ""}` : "No payments yet"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("pay")}
            className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-left hover:shadow-lg hover:from-emerald-500 hover:to-emerald-600 transition-all active:scale-[0.98] group">
            <div className="absolute top-2 right-2 w-16 h-16 bg-emerald-400/10 rounded-full blur-xl" />
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <p className="font-bold text-sm text-white">Pay Contribution</p>
            <p className="text-emerald-200 text-[11px] mt-0.5 flex items-center gap-1">
              {activeGroup ? `Due ${formatNaira(activeGroup.contributionAmount ?? 0)}` : "Set up payment"}
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </button>
          <button onClick={() => navigate("history")}
            className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl lg:rounded-2xl p-4 lg:p-5 text-left hover:shadow-md hover:border-gray-200 dark:hover:border-border/80 transition-all active:scale-[0.98] group">
            <div className="w-9 h-9 bg-gray-50 dark:bg-muted rounded-xl flex items-center justify-center mb-2.5 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
              <Receipt className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="font-bold text-sm text-gray-900 dark:text-white">View History</p>
            <p className="text-gray-400 text-[11px] mt-0.5 flex items-center gap-1">
              {contributions.length} payment{contributions.length !== 1 ? "s" : ""}
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      {recentPayments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-muted-foreground uppercase tracking-wider">Recent Activity</p>
            <button onClick={() => navigate("history")} className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">View all</button>
          </div>
          <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl lg:rounded-2xl divide-y divide-gray-50 dark:divide-border/50">
            {recentPayments.map((c, i) => (
              <div key={c.id || i} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 dark:hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                  {c.status === "paid" || c.status === "completed" ? (
                    <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    Contribution Payment
                  </p>
                  <p className="text-[10px] text-gray-400">{c.paidAt ? new Date(c.paidAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" }) : ""}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-extrabold text-gray-900 dark:text-white">{formatNaira(c.amount ?? 0)}</p>
                  <span className={`text-[10px] font-medium ${c.status === "paid" || c.status === "completed" ? "text-emerald-600" : c.status === "late" ? "text-red-500" : "text-amber-500"}`}>
                    {c.status === "paid" || c.status === "completed" ? "Completed" : c.status === "late" ? "Late" : c.status === "pending" ? "Pending" : c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!groupsLoading && groups.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-900 dark:text-white font-semibold">No groups yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Join a cooperative to start saving</p>
          <button onClick={() => navigate("groups")} className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
            Browse Groups
          </button>
        </div>
      )}
    </div>
  );
}
