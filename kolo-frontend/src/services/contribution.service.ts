import { apiClient } from "../api/client";
import type { Contribution } from "../types/platform.types";

export async function getContributions(): Promise<Contribution[]> {
  const { data } = await apiClient.get<{ data: Contribution[] }>("/contributions/my");
  return data.data;
}

export async function getContributionById(contributionId: string): Promise<Contribution> {
  const { data } = await apiClient.get<{ data: Contribution }>(`/contributions/${contributionId}`);
  return data.data;
}
