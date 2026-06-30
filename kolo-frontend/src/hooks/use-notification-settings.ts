import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotificationSettings, updateNotificationSettings } from "../services/notification.service";
import type { NotificationSettings } from "../types/platform.types";

export function useNotificationSettings() {
  return useQuery({
    queryKey: ["notification-settings"],
    queryFn: getNotificationSettings,
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: NotificationSettings) => updateNotificationSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
    },
  });
}
