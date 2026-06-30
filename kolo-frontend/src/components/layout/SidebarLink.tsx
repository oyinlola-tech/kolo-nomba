import type { ElementType } from "react";

interface SidebarLinkProps {
  icon: ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

export function SidebarLink({ icon: Icon, label, active, onClick, badge }: SidebarLinkProps) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left group ${
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}>
      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-emerald-400" : "text-gray-500 group-hover:text-gray-300"}`} />
      <span className="flex-1 truncate">{label}</span>
      {badge ? (
        <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{badge}</span>
      ) : null}
    </button>
  );
}
