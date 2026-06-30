import { useTheme } from "./use-theme";

export function useChartTheme() {
  const { dark } = useTheme();
  return {
    grid: dark ? "#1f2937" : "#f3f4f6",
    tick: dark ? "#6b7280" : "#9ca3af",
    tooltip: {
      contentStyle: {
        backgroundColor: dark ? "#111918" : "#fff",
        border: `1px solid ${dark ? "#1f2937" : "#e5e7eb"}`,
        borderRadius: "10px",
        color: dark ? "#f0f6fc" : "#111827",
        fontSize: "12px",
      },
    },
  };
}
