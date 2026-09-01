import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ElementType;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  iconClassName?: string;
  containerClassName?: string;
  color?: "cyan" | "emerald" | "purple" | "amber" | "indigo";
  compact?: boolean;
}

const COLOR_STYLES = {
  cyan: {
    iconBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    text: "text-cyan-400",
    glow: "shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    text: "text-emerald-400",
    glow: "shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]",
  },
  purple: {
    iconBg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    text: "text-purple-400",
    glow: "shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]",
  },
  amber: {
    iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    text: "text-amber-400",
    glow: "shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]",
  },
  indigo: {
    iconBg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    text: "text-indigo-400",
    glow: "shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]",
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  iconClassName,
  containerClassName,
  color = "cyan",
  compact = false,
  className,
  ...props
}: EmptyStateProps) {
  const styles = COLOR_STYLES[color] ?? COLOR_STYLES.cyan;

  if (compact) {
    return (
      <div
        className={cn(
          "flex-1 flex flex-col items-center justify-center min-h-[148px] py-6 px-4 text-center rounded-xl border border-dashed border-white/10 bg-black/20 relative z-10",
          className
        )}
        {...props}
      >
        <Icon className={cn("w-5 h-5 mb-1.5 opacity-70", styles.text, iconClassName)} />
        <span className="text-xs font-semibold text-zinc-300 tracking-wide">{title}</span>
        {description && (
          <span className="text-[11px] text-zinc-500 mt-0.5 max-w-xs">{description}</span>
        )}
        {action && <div className="mt-3">{action}</div>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center relative z-10",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 transition-all duration-300",
          styles.iconBg,
          styles.glow,
          containerClassName
        )}
      >
        <Icon className={cn("w-8 h-8", iconClassName)} />
      </div>
      <p className="text-sm text-zinc-300 font-semibold tracking-wide mb-1">
        {title}
      </p>
      {description && (
        <div className="text-xs text-zinc-500 max-w-sm leading-relaxed">
          {description}
        </div>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
