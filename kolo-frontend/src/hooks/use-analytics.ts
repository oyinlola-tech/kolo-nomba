import { useQuery } from "@tanstack/react-query";
import { getPlatformAnalytics, getGroupAnalytics } from "../services/analytics.service";

export function usePlatformAnalytics() {
  return useQuery({
    queryKey: ["analytics", "platform"],
    queryFn: getPlatformAnalytics,
  });
}

export function useGroupAnalytics(groupId: string) {
  return useQuery({
    queryKey: ["analytics", "group", groupId],
    queryFn: () => getGroupAnalytics(groupId),
    enabled: Boolean(groupId),
  });
}
