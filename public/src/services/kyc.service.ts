import { apiClient } from "../api/client";
import type { KycSubmission } from "../types/platform.types";

export async function getKycSubmissions(): Promise<KycSubmission[]> {
  const { data } = await apiClient.get<{ data: KycSubmission[] }>("/admin/kyc/submissions");
  return data.data;
}

export async function approveKyc(id: string): Promise<void> {
  await apiClient.post(`/admin/kyc/${id}/approve`);
}

export async function rejectKyc(id: string): Promise<void> {
  await apiClient.post(`/admin/kyc/${id}/reject`);
}
