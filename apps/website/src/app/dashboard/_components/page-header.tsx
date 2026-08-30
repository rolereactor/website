import { cn } from "@/lib/utils";
import { Audiowide } from "next/font/google";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface PageHeaderProps {
  category?: string;
  categoryIcon?: LucideIcon;
  title: string;
  description: string;
  badge?: {
    icon: LucideIcon;
    label: string;
    variant?: "default" | "cyan" | "yellow" | "emerald";
  };
  serverName?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  category,
  categoryIcon: CategoryIcon,
  title,
  description,
  badge,
  serverName,
  className,
  children,
}: PageHeaderProps) {
  const badgeVariant = badge?.variant
    ? ((badge.variant === "cyan"
        ? "accent"
        : badge.variant === "yellow"
          ? "premium"
          : badge.variant === "emerald"
            ? "success"
            : "default") as React.ComponentProps<typeof Badge>["variant"])
    : "default";

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-end justify-between gap-6",
        className
      )}
    >
      <div className="space-y-2 flex-1">
        {category && (
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest">
            {CategoryIcon && <CategoryIcon className="w-4 h-4" />}
            {category}
          </div>
        )}
        <h1
          className={cn(
            "text-3xl md:text-5xl font-black text-white tracking-tight flex flex-wrap items-center gap-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]",
            audiowide.className
          )}
        >
          <span className="bg-linear-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">
            {title}
          </span>
          {badge && (
            <Badge
              variant={badgeVariant}
              className="px-2 py-1 text-[10px] items-center gap-1.5"
            >
              <badge.icon className="w-3 h-3" />
              {badge.label}
            </Badge>
          )}
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 font-medium">
          <p className="max-w-xl leading-relaxed text-xs md:text-sm text-zinc-500">
            {description}
            {serverName && (
              <>
                {" "}
                <span className="text-cyan-400 font-bold">{serverName}</span>.
              </>
            )}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
