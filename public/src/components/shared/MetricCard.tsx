import type { ElementType } from "react";
import { Card } from "./Card";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: ElementType;
  iconBg?: string;
}

export function MetricCard({ title, value, change, positive = true, icon: Icon, iconBg = "bg-emerald-50 dark:bg-emerald-900/20" }: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        {change ? (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${positive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
            {change}
          </span>
        ) : null}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">{title}</p>
    </Card>
  );
}
