interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "full";
  theme?: "light" | "dark" | "auto";
  className?: string;
}

const sizes = {
  sm: { icon: 7, text: "text-sm", sub: "text-[7px]", spacing: "gap-1.5" },
  md: { icon: 8, text: "text-base", sub: "text-[8px]", spacing: "gap-2" },
  lg: { icon: 10, text: "text-lg", sub: "text-[9px]", spacing: "gap-2.5" },
};

export function Logo({ size = "md", variant = "full", theme = "auto", className = "" }: LogoProps) {
  const s = sizes[size];
  const titleColor = theme === "light"
    ? "text-white"
    : theme === "dark"
      ? "text-gray-900"
      : "text-gray-900 dark:text-white";
  const subColor = theme === "light"
    ? "text-emerald-200/70"
    : theme === "dark"
      ? "text-gray-500"
      : "text-gray-500 dark:text-muted-foreground";
  return (
    <div className={`flex items-center ${s.spacing} ${className}`}>
      <div style={{ width: `${s.icon * 4}px`, height: `${s.icon * 4}px` }} className="bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 48 48" fill="none" style={{ width: `${s.icon * 2.5}px`, height: `${s.icon * 2.5}px` }}>
          <path d="M15 36V12l14 16M15 22h12" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="29" cy="13" r="2.5" fill="#fff"/>
        </svg>
      </div>
      {variant === "full" && (
        <div>
          <p className={`font-extrabold tracking-tight ${titleColor} ${s.text} leading-none`}>KOLO</p>
          <p className={`font-semibold tracking-widest ${subColor} ${s.sub} leading-tight`}>COOPERATIVE SAVINGS</p>
        </div>
      )}
    </div>
  );
}
