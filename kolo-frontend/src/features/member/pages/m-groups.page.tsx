import { Building2, Plus, Loader2, ChevronRight, Users, PiggyBank, Calendar } from "lucide-react";
import { formatNaira } from "../../../utils/format";
import { useCooperatives } from "../../../hooks/use-cooperatives";
import { useNavigate } from "react-router";

export function MGroups() {
  const navigate = useNavigate();
  const { data, isLoading } = useCooperatives();
  const groups = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="px-4 md:px-6 lg:px-5 py-5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="px-4 sm:px-5 lg:px-6 py-4 lg:py-5">
        <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1">My Groups</p>
        <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6">You&apos;re not in any groups yet.</p>
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-muted-foreground">
          <div className="w-14 h-14 bg-gray-100 dark:bg-muted rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold">No groups found</p>
          <p className="text-xs mt-1 mb-4">Join a group to start saving together.</p>
          <div className="flex gap-3">
            <button onClick={() => navigate("/member/home")} className="border-2 border-dashed border-gray-200 dark:border-border rounded-xl px-5 py-2.5 flex items-center justify-center gap-2 text-xs text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors font-medium">
              <Plus className="w-3.5 h-3.5" />Join a Group
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-5 lg:px-6 py-4 lg:py-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">My Groups</p>
        <span className="text-xs text-gray-400 dark:text-muted-foreground bg-gray-50 dark:bg-muted px-2.5 py-1 rounded-full font-medium">{groups.length} active</span>
      </div>
      <p className="text-sm text-gray-500 dark:text-muted-foreground mb-5">You&apos;re in {groups.length} group{groups.length !== 1 ? "s" : ""}.</p>
      <div className="grid md:grid-cols-2 gap-3 lg:gap-4">
        {groups.map(g => (
          <button key={g.id} onClick={() => navigate(`/member/group/${g.id}`)}
            className="w-full text-left bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{g.name}</p>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-emerald-500 transition-colors" />
                </div>
                <p className="text-[10px] text-gray-400 truncate">Admin: {g.adminName || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-2.5 lg:p-3">
                <PiggyBank className="w-3.5 h-3.5 text-emerald-500 mb-1" />
                <p className="text-xs lg:text-sm font-extrabold text-gray-900 dark:text-white">{formatNaira(g.savingsBalance ?? 0)}</p>
                <p className="text-[9px] lg:text-[10px] text-gray-400 mt-0.5">Savings</p>
              </div>
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-2.5 lg:p-3">
                <Users className="w-3.5 h-3.5 text-blue-500 mb-1" />
                <p className="text-xs lg:text-sm font-extrabold text-gray-900 dark:text-white">{g.memberCount}</p>
                <p className="text-[9px] lg:text-[10px] text-gray-400 mt-0.5">Members</p>
              </div>
              <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-2.5 lg:p-3">
                <Calendar className="w-3.5 h-3.5 text-amber-500 mb-1" />
                <p className="text-xs lg:text-sm font-extrabold text-gray-900 dark:text-white capitalize">{g.status === "active" ? "Active" : g.status}</p>
                <p className="text-[9px] lg:text-[10px] text-gray-400 mt-0.5">Status</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <button onClick={() => navigate("/member/home")}
        className="mt-4 w-full border-2 border-dashed border-gray-200 dark:border-border rounded-xl lg:rounded-2xl p-3.5 flex items-center justify-center gap-2 text-xs text-gray-400 hover:border-emerald-300 hover:text-emerald-600 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-colors font-medium">
        <Plus className="w-3.5 h-3.5" />Join a New Group
      </button>
    </div>
  );
}
