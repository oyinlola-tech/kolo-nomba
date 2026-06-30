import { getInitials } from "../../utils/format";

const AV_COLORS = [
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
];

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ name, size = "md" }: AvatarProps) {
  const sz = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" }[size];
  const safeName = name || "?";
  const c = AV_COLORS[safeName.charCodeAt(0) % AV_COLORS.length];
  return (
    <div className={`${sz} ${c} rounded-full flex items-center justify-center font-bold flex-shrink-0 select-none`}>
      {getInitials(safeName)}
    </div>
  );
}
