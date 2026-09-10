"use client";

import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CyberpunkBackground } from "@/components/common/cyberpunk-background";
import { cn } from "@/lib/utils";
import { audiowide } from "@/lib/fonts";

export type StatePanelVariant = "empty" | "error" | "locked";

interface StatePanelProps {
  variant?: StatePanelVariant;
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
  className?: string;
}

const variantStyles: Record<
  StatePanelVariant,
  {
    card: string;
    tile: string;
    iconColor: string;
    icon: string;
    gridColor: string;
    glow: [string, string];
  }
> = {
  empty: {
    card: "border-white/10",
    tile: "bg-cyan-500/10 border-cyan-500/20",
    iconColor: "text-cyan-400",
    icon: "",
    gridColor: "#06b6d4",
    glow: ["rgba(6,182,212,0.06)", "rgba(217,70,239,0.05)"],
  },
  error: {
    card: "border-red-500/20",
    tile: "bg-red-500/10 border-red-500/20",
    iconColor: "text-red-400",
    icon: "animate-pulse",
    gridColor: "#ef4444",
    glow: ["rgba(239,68,68,0.08)", "rgba(239,68,68,0.04)"],
  },
  locked: {
    card: "border-amber-500/20",
    tile: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-400",
    icon: "",
    gridColor: "#f59e0b",
    glow: ["rgba(245,158,11,0.06)", "rgba(245,158,11,0.04)"],
  },
};

export function StatePanel({
  variant = "empty",
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
  className,
}: StatePanelProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      variant="cyberpunk"
      className={cn("overflow-hidden relative w-full", styles.card, className)}
    >
      <CyberpunkBackground
        gridSize={20}
        gridOpacity={0.03}
        gridColor={styles.gridColor}
        primaryGlow={styles.glow[0]}
        secondaryGlow={styles.glow[1]}
      />
      <CardContent className="p-12 flex flex-col items-center text-center relative z-10 space-y-4">
        <div
          className={cn(
            "w-16 h-16 rounded-2xl border flex items-center justify-center mb-2",
            styles.tile,
            styles.iconColor
          )}
        >
          <Icon className={cn("w-8 h-8", styles.icon)} />
        </div>
        <h3 className={cn("text-xl text-white tracking-wider", audiowide.className)}>
          {title}
        </h3>
        {description && (
          <p className="text-zinc-400 text-sm max-w-sm">{description}</p>
        )}
        {actionLabel && onAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            className={cn(
              "mt-2 uppercase tracking-widest font-black text-[10px]",
              variant === "error" &&
                "border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/40"
            )}
          >
            {actionLabel}
          </Button>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
