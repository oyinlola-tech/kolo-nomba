import { apiClient } from "../api/client";

export interface VirtualAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  providerReference: string;
  status: string;
  createdAt: string;
}

export async function getMyVirtualAccount(): Promise<VirtualAccount | null> {
  const { data } = await apiClient.get<{ data: VirtualAccount | null }>("/virtual-accounts/my");
  return data.data;
}

export async function createVirtualAccount(): Promise<VirtualAccount> {
  const { data } = await apiClient.post<{ data: VirtualAccount }>("/virtual-accounts");
  return data.data;
}
