import { Building2, Plus, Loader2, ChevronRight, Users, PiggyBank, Calendar, CheckCircle, X, UserPlus } from "lucide-react";
import { formatNaira } from "../../../utils/format";
import { useCooperatives } from "../../../hooks/use-cooperatives";
import { useNavigate } from "react-router";
import { apiClient } from "../../../api/client";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../components/shared/Button";

export function MGroups() {
  const navigate = useNavigate();
  const { data, isLoading } = useCooperatives();
  const groups = data?.items ?? [];
  const queryClient = useQueryClient();
  const [availableGroups, setAvailableGroups] = useState<Array<{ id: string; name: string; description: string; memberCount: number; savingsBalance: number; adminName: string }>>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [joinResult, setJoinResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showBrowse, setShowBrowse] = useState(false);

  useEffect(() => {
    if (showBrowse && availableGroups.length === 0) {
      setLoadingAvailable(true);
      apiClient.get("/groups/available").then((res) => {
        setAvailableGroups(res.data?.data ?? []);
      }).catch(() => {}).finally(() => setLoadingAvailable(false));
    }
  }, [showBrowse, availableGroups.length]);

  const handleJoinGroup = async (groupId: string, groupName: string) => {
    setJoining(groupId);
    setJoinResult(null);
    try {
      await apiClient.post(`/groups/${groupId}/join`);
      setJoinResult({ type: "success", message: `Joined ${groupName}!` });
      setAvailableGroups((prev) => prev.filter((g) => g.id !== groupId));
      queryClient.invalidateQueries({ queryKey: ["cooperatives"] });
    } catch {
      setJoinResult({ type: "error", message: "Failed to join group" });
    } finally {
      setJoining(null);
    }
  };

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
          <button onClick={() => setShowBrowse(true)} className="border-2 border-dashed border-gray-200 dark:border-border rounded-xl px-5 py-2.5 flex items-center justify-center gap-2 text-xs text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors font-medium">
            <UserPlus className="w-3.5 h-3.5" />Browse Available Groups
          </button>
        </div>
        {showBrowse && renderAvailableGroups()}
      </div>
    );
  }

  function renderAvailableGroups() {
    return (
      <div className="mt-6">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Available Groups</p>
        {joinResult && (
          <div className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
            joinResult.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}>
            {joinResult.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
            {joinResult.message}
            <button onClick={() => setJoinResult(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}
        {loadingAvailable ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
        ) : availableGroups.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No other groups available to join.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {availableGroups.map((g) => (
              <div key={g.id} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{g.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{g.adminName || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{g.memberCount}</span>
                  <span className="flex items-center gap-1"><PiggyBank className="w-3 h-3" />{formatNaira(g.savingsBalance ?? 0)}</span>
                </div>
                <Button full size="sm" onClick={() => handleJoinGroup(g.id, g.name)} disabled={joining === g.id}>
                  {joining === g.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  {joining === g.id ? "Joining..." : "Join Group"}
                </Button>
              </div>
            ))}
          </div>
        )}
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
      {!showBrowse ? (
        <button onClick={() => setShowBrowse(true)}
          className="mt-4 w-full border-2 border-dashed border-gray-200 dark:border-border rounded-xl lg:rounded-2xl p-3.5 flex items-center justify-center gap-2 text-xs text-gray-400 hover:border-emerald-300 hover:text-emerald-600 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-colors font-medium">
          <UserPlus className="w-3.5 h-3.5" />Browse Available Groups
        </button>
      ) : (
        renderAvailableGroups()
      )}
    </div>
  );
}
