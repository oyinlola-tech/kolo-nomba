import { useQuery } from "@tanstack/react-query";
import { getCooperatives } from "../services/cooperative.service";

export function useCooperatives() {
  return useQuery({
    queryKey: ["cooperatives"],
    queryFn: getCooperatives,
  });
}
