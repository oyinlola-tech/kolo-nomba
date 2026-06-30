import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../services/notification.service";

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: () => getNotifications(page, limit),
  });
}
