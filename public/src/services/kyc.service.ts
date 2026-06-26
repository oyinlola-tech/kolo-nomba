import { apiClient } from "../api/client";
import type { KycSubmission } from "../types/platform.types";

export async function getKycSubmissions(): Promise<KycSubmission[]> {
  const { data } = await apiClient.get<{ data: KycSubmission[] }>("/admin/users");
  return data.data as unknown as KycSubmission[];
}

export async function approveKyc(id: string): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/verify`);
}

export async function rejectKyc(id: string): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/status`, { status: "SUSPENDED" });
}
