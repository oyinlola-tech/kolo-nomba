import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "../utils/env";

export function useRealtimeNotifications() {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const apiUrl = getApiUrl();
    const url = `${apiUrl}/notifications/sse`;

    function connect() {
      const es = new EventSource(url, { withCredentials: true });

      es.addEventListener("notification", () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      });

      es.addEventListener("payment", () => {
        queryClient.invalidateQueries({ queryKey: ["payments"] });
        queryClient.invalidateQueries({ queryKey: ["contributions"] });
      });

      es.onerror = () => {
        es.close();
        retryRef.current = setTimeout(connect, 5000);
      };

      esRef.current = es;
    }

    connect();

    return () => {
      esRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [queryClient]);
}
