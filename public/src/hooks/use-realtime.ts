import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtimeNotifications() {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, "") ?? "";
    const url = `${baseUrl}/api/v1/notifications/sse`;

    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    es.addEventListener("notification", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    es.addEventListener("payment", () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
    });

    es.onerror = () => {
      es.close();
      setTimeout(() => {
        esRef.current = new EventSource(url, { withCredentials: true });
      }, 5000);
    };

    return () => {
      es.close();
    };
  }, [queryClient]);
}
