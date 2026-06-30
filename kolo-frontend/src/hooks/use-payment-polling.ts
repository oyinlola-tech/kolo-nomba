import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function usePaymentPolling(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
    }, 5000);
    return () => clearInterval(interval);
  }, [enabled, queryClient]);
}
