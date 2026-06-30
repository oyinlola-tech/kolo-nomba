import { apiClient } from "../api/client";
import type { PaginatedResponse, User } from "../types/platform.types";

export async function getUsers(page = 1, limit = 20): Promise<PaginatedResponse<User>> {
  const res = await apiClient.get<{ data: User[] | PaginatedResponse<User> }>("/admin/users", { params: { page, limit } });
  if ("items" in res.data.data) return res.data.data;
  const items = Array.isArray(res.data.data) ? res.data.data : [];
  return { items, pagination: { page, limit, total: items.length, totalPages: 1, hasNext: false, hasPrev: false } };
}
