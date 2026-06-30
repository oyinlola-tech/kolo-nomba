import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../services/user.service";

export function useUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["users", page, limit],
    queryFn: () => getUsers(page, limit),
  });
}
