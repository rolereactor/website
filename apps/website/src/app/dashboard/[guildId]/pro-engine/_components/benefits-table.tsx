"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Benefit {
  name: string;
  category: string;
  tooltip: string;
  type: "limit" | "feature";
  free: string | boolean;
  pro: string | boolean;
}

const categoryStyles: Record<
  string,
  { bg: string; badge: string; badgeBg: string }
> = {
  "Role Reactions": {
    bg: "bg-cyan-500/5",
    badge: "text-cyan-400",
    badgeBg: "bg-cyan-500/20",
  },
  Giveaways: {
    bg: "bg-pink-500/5",
    badge: "text-pink-400",
    badgeBg: "bg-pink-500/20",
  },
  Leveling: {
    bg: "bg-emerald-500/5",
    badge: "text-emerald-400",
    badgeBg: "bg-emerald-500/20",
  },
  Automation: {
    bg: "bg-purple-500/5",
    badge: "text-purple-400",
    badgeBg: "bg-purple-500/20",
  },
  Ticketing: {
    bg: "bg-amber-500/5",
    badge: "text-amber-400",
    badgeBg: "bg-amber-500/20",
  },
  "Auto-Moderation": {
    bg: "bg-red-500/5",
    badge: "text-red-400",
    badgeBg: "bg-red-500/20",
  },
};

function BenefitRow({
  item,
  style,
  isFirstOfCategory,
}: {
  item: Benefit;
  style: (typeof categoryStyles)[keyof typeof categoryStyles];
  isFirstOfCategory: boolean;
}) {
  const isFeature = item.type === "feature";
  return (
    <div
      className={cn(
        "group grid grid-cols-12 gap-2 px-4 py-3 items-center text-xs transition-colors hover:bg-white/2",
        isFirstOfCategory && "border-t border-white/5",
        isFirstOfCategory && style.bg
      )}
    >
      {/* Feature Name with Category Badge & Tooltip */}
      <div className="col-span-5 flex items-center gap-2">
        {isFirstOfCategory && (
          <span
            className={cn(
              "text-[9px] font-bold px-2 py-0.5 rounded shrink-0",
              style.badgeBg,
              style.badge
            )}
          >
            {item.category}
          </span>
        )}
        <span
          className={cn(
            "text-zinc-400 flex items-center gap-1",
            isFirstOfCategory && "font-medium"
          )}
        >
          {item.name}
        </span>
        <div className="relative group/info">
          <Info className="w-3 h-3 text-zinc-600 cursor-help" />
          <div className="absolute left-0 bottom-full mb-1 px-2 py-1 bg-zinc-800 text-[10px] text-zinc-300 rounded whitespace-nowrap z-10 shadow-lg border border-white/10 hidden group-hover/info:block">
            {item.tooltip}
          </div>
        </div>
      </div>

      {/* Free Value */}
      <div className="col-span-3 text-center flex items-center justify-center">
        {typeof item.free === "boolean" ? (
          item.free ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <span className="font-mono text-xs text-zinc-700">—</span>
          )
        ) : (
          <span
            className={cn(
              "font-mono text-xs",
              isFeature ? "text-zinc-600" : "text-zinc-500"
            )}
          >
            {item.free}
          </span>
        )}
      </div>

      {/* Pro Value */}
      <div className="col-span-4 text-center flex items-center justify-center gap-1">
        {typeof item.pro === "boolean" ? (
          item.pro ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <X className="w-4 h-4 text-zinc-700" />
          )
        ) : (
          <span className="text-purple-400 font-bold">{item.pro}</span>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 px-4 py-3 items-center animate-pulse">
          <div className="col-span-5 h-4 bg-zinc-800 rounded w-3/4" />
          <div className="col-span-3 flex justify-center">
            <div className="h-4 bg-zinc-800 rounded w-8" />
          </div>
          <div className="col-span-4 flex justify-center">
            <div className="h-4 bg-zinc-800 rounded w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ProEngineBenefitsProps {
  isActive?: boolean;
}

export function ProEngineBenefits({
  isActive = false,
}: ProEngineBenefitsProps) {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBenefits() {
      try {
        const res = await fetch("/api/premium/benefits");
        const data = await res.json();
        if (data.success && data.benefits) {
          setBenefits(data.benefits);
        }
      } catch {
        // Silently fail — show empty table
      } finally {
        setLoading(false);
      }
    }
    fetchBenefits();
  }, []);

  return (
    <Card className="border-purple-500/20 bg-zinc-950/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-purple-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-white">
              Pro Engine Benefits
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isActive ? (
              <Badge
                variant="outline"
                className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]"
              >
                <Check className="w-3 h-3 mr-1" />
                ACTIVE
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-[10px]"
              >
                <Zap className="w-3 h-3 mr-1" />
                20 Cores / week
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-b border-white/5 bg-zinc-900/30 flex items-center gap-4 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="font-mono text-zinc-400">3</span> = Limit
        </span>
        <span className="flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-400" /> = Included
        </span>
        <span className="flex items-center gap-1">
          <span className="text-zinc-700">—</span> = Not available
        </span>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 bg-zinc-900/50 text-[10px] font-black uppercase tracking-widest text-zinc-500">
        <div className="col-span-5">Feature</div>
        <div className="col-span-3 text-center">Free</div>
        <div className="col-span-4 text-center text-purple-400">Pro Engine</div>
      </div>

      {/* Table Body */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="divide-y divide-white/5">
          {benefits.map((item, index) => {
            const style = categoryStyles[item.category];
            const isFirstOfCategory =
              index === 0 || benefits[index - 1].category !== item.category;

            return (
              <BenefitRow
                key={item.name}
                item={item}
                style={style}
                isFirstOfCategory={isFirstOfCategory}
              />
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5 bg-zinc-900/30">
        <p className="text-[10px] text-zinc-500 text-center">
          All limits reset monthly. Upgrade anytime for instant access.
        </p>
      </div>
    </Card>
  );
}
