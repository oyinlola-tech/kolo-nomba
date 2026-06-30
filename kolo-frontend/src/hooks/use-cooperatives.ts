import { useQuery } from "@tanstack/react-query";
import { getCooperatives } from "../services/cooperative.service";

export function useCooperatives(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["cooperatives", page, limit],
    queryFn: () => getCooperatives(page, limit),
  });
}
