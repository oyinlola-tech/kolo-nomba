import { useState } from "react";
import { Search, Filter, Download, Building2, Eye, MoreVertical, Loader2, AlertTriangle } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { useCooperatives } from "../../../hooks/use-cooperatives";
import { formatNaira } from "../../../utils/format";

export function SAGroups() {
  const { data: groups, isLoading, error } = useCooperatives();
  const [search, setSearch] = useState("");
  const filtered = (groups || []).filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Group Management" />
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
          <p className="text-sm">Loading groups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Group Management" />
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mb-3 text-red-400" />
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Failed to load groups</p>
          <p className="text-xs mt-1">The backend may be unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Group Management" subtitle={`${groups?.length || 0} total groups`}>
        <Button size="sm" variant="secondary"><Download className="w-4 h-4" />Export</Button>
      </PageHeader>
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-border flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input placeholder="Search groups…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-border rounded-xl bg-white dark:bg-input-background text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <Button variant="secondary" size="sm"><Filter className="w-4 h-4" />Filter</Button>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
            <p className="text-sm font-semibold">No groups found</p>
            <p className="text-xs mt-1">{search ? "Try a different search term." : "No cooperatives registered yet."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-border">
                  {["Group", "Admin", "Members", "Total Savings", "Status", "Created", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-border">
                {filtered.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{g.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{g.adminName}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{g.memberCount}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{formatNaira(g.savingsBalance ?? 0)}</td>
                    <td className="px-4 py-3"><Badge status={g.status} /></td>
                    <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground whitespace-nowrap">{g.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" /></Button>
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
