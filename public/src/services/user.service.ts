import { apiClient } from "../api/client";
import type { User } from "../types/platform.types";

export async function getUsers(): Promise<User[]> {
  const { data } = await apiClient.get<{ data: { items: User[] } }>("/admin/users");
  return data.data.items ?? data.data as never as User[];
}
