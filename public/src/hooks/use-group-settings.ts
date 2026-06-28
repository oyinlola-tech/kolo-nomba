import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGroupSettings,
  updateGroupSettings,
  type GroupSettings,
  type UpdateGroupSettingsPayload,
} from "../services/group-settings.service";

export function useGroupSettings(groupId: string) {
  return useQuery({
    queryKey: ["group-settings", groupId],
    queryFn: () => getGroupSettings(groupId),
    enabled: Boolean(groupId),
  });
}

export function useUpdateGroupSettings(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateGroupSettingsPayload) => updateGroupSettings(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-settings", groupId] });
      queryClient.invalidateQueries({ queryKey: ["cooperatives"] });
    },
  });
}
