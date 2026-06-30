import { apiClient } from "../api/client";

export async function downloadReceipt(reference: string): Promise<Blob> {
  const { data } = await apiClient.get(`/payments/receipt/${reference}`, { responseType: "blob" });
  return data;
}
