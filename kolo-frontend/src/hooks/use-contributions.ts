import { useQuery } from "@tanstack/react-query";
import { getContributions, getContributionById } from "../services/contribution.service";

export function useContributions(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["contributions", page, limit],
    queryFn: () => getContributions(page, limit),
  });
}

export function useContribution(contributionId: string | null) {
  return useQuery({
    queryKey: ["contribution", contributionId],
    queryFn: () => getContributionById(contributionId!),
    enabled: Boolean(contributionId),
  });
}
