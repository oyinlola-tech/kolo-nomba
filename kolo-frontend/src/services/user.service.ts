import { apiClient } from "../api/client";
import type { User } from "../types/platform.types";

export async function getUsers(): Promise<User[]> {
  const res = await apiClient.get<{ data: User[] }>("/admin/users");
  return Array.isArray(res.data.data) ? res.data.data : [];
}
