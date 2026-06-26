import { apiClient } from "../api/client";
import type { AuditLog } from "../types/platform.types";

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data } = await apiClient.get<{ data: { items: AuditLog[] } }>("/admin/audit-logs");
  return data.data.items ?? data.data as never as AuditLog[];
}
