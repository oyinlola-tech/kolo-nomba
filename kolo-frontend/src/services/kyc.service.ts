import { apiClient } from "../api/client";
import type { KycSubmission } from "../types/platform.types";

export async function getKycSubmissions(): Promise<KycSubmission[]> {
  const { data } = await apiClient.get<{ data: { id: string; firstName: string; lastName: string; email: string; phone: string; status: string; createdAt: string }[] }>("/admin/kyc-submissions");
  const users = data.data ?? [];
  return users.map(u => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    phone: u.phone,
    type: "Identity Verification",
    status: u.status,
    submittedAt: u.createdAt,
  }));
}

export async function approveKyc(id: string): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/verify`);
}

export async function rejectKyc(id: string): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/status`, { status: "KYC_REJECTED" });
}
