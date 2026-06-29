import { useState } from "react";
import { Search, UserPlus, Eye, Send, MoreVertical, Loader2 } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { Avatar } from "../../../components/shared/Avatar";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { useCooperatives } from "../../../hooks/use-cooperatives";
import { useGroupMembers } from "../../../hooks/use-group-members";

export function GAMembers() {
  const [search, setSearch] = useState("");
  const { data: groups } = useCooperatives();
  const groupId = (groups && groups.length > 0) ? groups[0].id : "";
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
        <Button size="sm"><UserPlus className="w-4 h-4" />Invite Member</Button>
      </PageHeader>
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
                        <Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm"><Send className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm"><MoreVertical className="w-3.5 h-3.5" /></Button>
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
