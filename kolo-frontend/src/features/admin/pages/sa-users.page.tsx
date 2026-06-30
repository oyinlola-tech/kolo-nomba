import { useState } from "react";
import { Search, Filter, Download, UserPlus, Eye, Edit, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { Avatar } from "../../../components/shared/Avatar";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { useUsers } from "../../../hooks/use-users";

export function SAUsers() {
  const { data: users, isLoading, error } = useUsers();
  const [search, setSearch] = useState("");

  const filtered = (users || []).filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div>
        <PageHeader title="User Management" subtitle="Loading users..." />
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
          <p className="text-sm">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="User Management" subtitle="Error loading users" />
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mb-3 text-red-400" />
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Failed to load users</p>
          <p className="text-xs mt-1">The backend may be unavailable. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="User Management" subtitle={`${users?.length || 0} total users`}>
        <Button size="sm" variant="secondary"><Download className="w-4 h-4" />Export</Button>
        <Button size="sm"><UserPlus className="w-4 h-4" />Add User</Button>
      </PageHeader>
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-border rounded-xl bg-white dark:bg-input-background text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <Button variant="secondary" size="sm"><Filter className="w-4 h-4" />Filter</Button>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-muted-foreground">
            <p className="text-sm font-semibold">No users found</p>
            <p className="text-xs mt-1">{search ? "Try a different search term." : "No users registered yet."}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-border">
                    {["User", "Phone", "Type", "Status", "Joined", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-border">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{u.phone}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-muted px-2 py-1 rounded-full">{u.role}</span>
                      </td>
                      <td className="px-4 py-3"><Badge status={u.status} /></td>
                      <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground whitespace-nowrap">{u.createdAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm"><Edit className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-border flex items-center justify-between text-xs text-gray-500 dark:text-muted-foreground">
              <span>Showing {filtered.length} of {users?.length || 0} users</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm"><ChevronLeft className="w-3.5 h-3.5" /></Button>
                <span className="px-2">1 of 1</span>
                <Button variant="ghost" size="sm"><ChevronRight className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
