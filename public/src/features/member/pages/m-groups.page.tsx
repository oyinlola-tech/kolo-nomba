import { Building2, Plus, Loader2, ChevronRight } from "lucide-react";
import { Badge } from "../../../components/shared/Badge";
import { formatNaira } from "../../../utils/format";
import { useCooperatives } from "../../../hooks/use-cooperatives";
import { useNavigate } from "react-router";

export function MGroups() {
  const navigate = useNavigate();
  const { data: cooperatives, isLoading } = useCooperatives();
  const groups = cooperatives || [];

  if (isLoading) {
    return (
      <div className="px-4 md:px-6 py-5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="px-4 md:px-6 py-5">
        <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">My Groups</p>
        <p className="text-sm text-gray-500 dark:text-muted-foreground mb-5">You&apos;re not in any groups yet.</p>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <p className="text-sm font-semibold">No groups found</p>
          <p className="text-xs mt-1">Join a group to start saving together.</p>
        </div>
        <button className="w-full border-2 border-dashed border-gray-200 dark:border-border rounded-2xl p-4 flex items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />Join a Group
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-5">
      <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">My Groups</p>
      <p className="text-sm text-gray-500 dark:text-muted-foreground mb-5">You&apos;re active in {groups.length} group{(groups.length !== 1 ? "s" : "")}.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {groups.map(g => (
          <button key={g.id} onClick={() => navigate(`/member/group/${g.id}`)} className="w-full text-left bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900 dark:text-white">{g.name}</p>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">Admin: {g.adminName}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="bg-gray-50 dark:bg-muted rounded-xl p-2.5">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatNaira(g.savingsBalance ?? 0)}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Group Savings</p>
              </div>
              <div className="bg-gray-50 dark:bg-muted rounded-xl p-2.5">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{g.memberCount}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Members</p>
              </div>
              <div className="bg-gray-50 dark:bg-muted rounded-xl p-2.5">
                <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{g.status}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Status</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{g.memberCount} member{g.memberCount !== 1 ? "s" : ""}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
