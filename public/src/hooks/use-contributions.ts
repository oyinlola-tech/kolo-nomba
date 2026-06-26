import { useQuery } from "@tanstack/react-query";
import { getContributions } from "../services/contribution.service";

export function useContributions() {
  return useQuery({
    queryKey: ["contributions"],
    queryFn: getContributions,
  });
}
