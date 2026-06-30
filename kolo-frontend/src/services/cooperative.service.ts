import { apiClient } from "../api/client";
import type { Cooperative } from "../types/platform.types";

export async function getCooperatives(): Promise<Cooperative[]> {
  const { data } = await apiClient.get<{ data: Cooperative[] }>("/groups");
  return data.data;
}
