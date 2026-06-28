import { useQuery } from "@tanstack/react-query";
import { getContributions, getContributionById } from "../services/contribution.service";

export function useContributions() {
  return useQuery({
    queryKey: ["contributions"],
    queryFn: getContributions,
  });
}

export function useContribution(contributionId: string | null) {
  return useQuery({
    queryKey: ["contribution", contributionId],
    queryFn: () => getContributionById(contributionId!),
    enabled: Boolean(contributionId),
  });
}
