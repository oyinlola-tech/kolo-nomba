import { useState } from "react";
import { Search, UserPlus, Eye, Send, MoreVertical, Loader2, Check, X } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { Avatar } from "../../../components/shared/Avatar";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { apiClient } from "../../../api/client";
import { useCooperatives } from "../../../hooks/use-cooperatives";
import { useGroupMembers } from "../../../hooks/use-group-members";

export function GAMembers() {
  const [search, setSearch] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { data: groupData } = useCooperatives();
  const groups = groupData?.items ?? [];
  const groupId = groups.length > 0 ? groups[0].id : "";
  const { data: members, isLoading } = useGroupMembers(groupId);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Member Management" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const memberList = members || [];
  const filtered = memberList.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Member Management" subtitle={`${memberList.length} members in your group`}>
        <Button size="sm" onClick={async () => {
          const email = prompt("Enter email to invite:");
          if (!email) return;
          setInviting(true);
          setInviteResult(null);
          try {
            await apiClient.post(`/groups/${groupId}/invitations`, { email });
            setInviteResult({ type: "success", message: `Invitation sent to ${email}` });
          } catch {
            setInviteResult({ type: "error", message: "Failed to send invitation. Please try again." });
          } finally {
            setInviting(false);
          }
        }} disabled={inviting}>
          {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}{inviting ? "Sending..." : "Invite Member"}
        </Button>
      </PageHeader>
      {inviteResult && (
        <div className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
          inviteResult.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
        }`}>
          {inviteResult.type === "success" ? <Check className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
          {inviteResult.message}
          <button onClick={() => setInviteResult(null)} className="ml-auto text-current opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-border flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-border rounded-xl bg-white dark:bg-input-background text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
            <p className="text-sm font-semibold">No members found</p>
            <p className="text-xs mt-1">Invite members to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-border">
                  {["Member", "Role", "Status", "Joined", "Email", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-border">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} size="sm" />
                        <span className="font-medium text-gray-900 dark:text-white">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{m.role}</td>
                    <td className="px-4 py-3"><Badge status={m.status} /></td>
                    <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground whitespace-nowrap">{m.joinedAt}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground">{m.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" aria-label="View member"><Eye className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" aria-label="Send message"><Send className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" aria-label="Member actions"><MoreVertical className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
