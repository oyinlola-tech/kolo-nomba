import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../services/audit.service";

export function useAuditLogs(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["audit-logs", page, limit],
    queryFn: () => getAuditLogs(page, limit),
  });
}
