import { useQuery } from "@tanstack/react-query";
import { getGroupMembers } from "../services/group-members.service";

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ["group-members", groupId],
    queryFn: () => getGroupMembers(groupId),
    enabled: Boolean(groupId),
  });
}
