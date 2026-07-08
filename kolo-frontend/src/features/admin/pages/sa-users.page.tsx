import { useState } from "react";
import { Search, Filter, Download, UserPlus, Eye, Edit, Loader2, AlertTriangle, CheckCircle, X } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { Avatar } from "../../../components/shared/Avatar";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { Pagination } from "../../../components/shared/Pagination";
import { useUsers } from "../../../hooks/use-users";
import { downloadCsv } from "../../../utils/csv";
import { apiClient } from "../../../api/client";

export function SAUsers() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useUsers(page);
  const users = data?.items ?? [];
  const pagination = data?.pagination;
  const [search, setSearch] = useState("");
  const [addingUser, setAddingUser] = useState(false);
  const [addResult, setAddResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const filtered = users.filter(u =>
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

  const handleExport = () => {
    downloadCsv(
      "users.csv",
      ["User", "Phone", "Email", "Role", "Status", "Joined"],
      filtered.map(u => [u.name, u.phone, u.email, u.role, u.status, u.createdAt]),
    );
  };

  return (
    <div>
      {addResult && (
        <div className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
          addResult.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
        }`}>
          {addResult.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
          {addResult.message}
          <button onClick={() => setAddResult(null)} className="ml-auto text-current opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      <PageHeader title="User Management" subtitle={`${pagination?.total ?? users.length} total users`}>
        <Button size="sm" variant="secondary" onClick={handleExport}><Download className="w-4 h-4" />Export</Button>
        <Button size="sm" onClick={async () => {
          const email = prompt("Enter new user email:");
          if (!email) return;
          const name = prompt("Enter full name:");
          if (!name) return;
          const role = prompt("Enter role (MEMBER/GROUP_ADMIN):") || "MEMBER";
          setAddingUser(true);
          setAddResult(null);
          try {
            await apiClient.post("/auth/register", { email, name, role });
            setAddResult({ type: "success", message: `User ${email} created` });
          } catch {
            setAddResult({ type: "error", message: "Failed to create user" });
          } finally {
            setAddingUser(false);
          }
        }} disabled={addingUser}>
          {addingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {addingUser ? "Adding..." : "Add User"}
        </Button>
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
                          <Button variant="ghost" size="sm" aria-label="View user"><Eye className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" aria-label="Edit user"><Edit className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
          </>
        )}
      </Card>
    </div>
  );
}
