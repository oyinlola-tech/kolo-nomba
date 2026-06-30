import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../services/audit.service";

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: getAuditLogs,
  });
}
