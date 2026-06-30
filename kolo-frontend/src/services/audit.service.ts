import { apiClient } from "../api/client";
import type { AuditLog, PaginatedResponse } from "../types/platform.types";

export async function getAuditLogs(page = 1, limit = 20): Promise<PaginatedResponse<AuditLog>> {
  const res = await apiClient.get<{ data: AuditLog[] | PaginatedResponse<AuditLog> }>("/admin/audit-logs", { params: { page, limit } });
  if ("items" in res.data.data) return res.data.data;
  const items = Array.isArray(res.data.data) ? res.data.data : [];
  return { items, pagination: { page, limit, total: items.length, totalPages: 1, hasNext: false, hasPrev: false } };
}
