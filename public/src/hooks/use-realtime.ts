import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtimeNotifications() {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL as string;
    if (!apiUrl) return;
    const url = `${apiUrl.replace(/\/+$/, "")}/notifications/sse`;

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
        setTimeout(connect, 5000);
      };

      esRef.current = es;
    }

    connect();

    return () => {
      esRef.current?.close();
    };
  }, [queryClient]);
}
