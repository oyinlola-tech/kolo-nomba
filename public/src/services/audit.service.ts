import { apiClient } from "../api/client";
import type { AuditLog } from "../types/platform.types";

export async function getAuditLogs(): Promise<AuditLog[]> {
  const res = await apiClient.get<{ data: AuditLog[] }>("/admin/audit-logs");
  return Array.isArray(res.data.data) ? res.data.data : [];
}
