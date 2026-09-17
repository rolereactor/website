"use client";

import { useState, useEffect, useMemo } from "react";
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

const PALETTE = [
  { accent: "border-cyan-500", text: "text-cyan-400", bg: "bg-cyan-500/10" },
  { accent: "border-pink-500", text: "text-pink-400", bg: "bg-pink-500/10" },
  { accent: "border-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  { accent: "border-purple-500", text: "text-purple-400", bg: "bg-purple-500/10" },
  { accent: "border-amber-500", text: "text-amber-400", bg: "bg-amber-500/10" },
  { accent: "border-red-500", text: "text-red-400", bg: "bg-red-500/10" },
  { accent: "border-blue-500", text: "text-blue-400", bg: "bg-blue-500/10" },
  { accent: "border-orange-500", text: "text-orange-400", bg: "bg-orange-500/10" },
  { accent: "border-teal-500", text: "text-teal-400", bg: "bg-teal-500/10" },
  { accent: "border-indigo-500", text: "text-indigo-400", bg: "bg-indigo-500/10" },
];

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2 animate-pulse">
          <div className="h-3 bg-zinc-800 rounded w-24" />
          <div className="h-8 bg-zinc-800/50 rounded" />
          <div className="h-8 bg-zinc-800/50 rounded" />
        </div>
      ))}
    </div>
  );
}

interface ProEngineBenefitsProps {
  isActive?: boolean;
}

interface ProPricing {
  cost: number;
  period: string;
  periodDays: number;
}

export function ProEngineBenefits({
  isActive = false,
}: ProEngineBenefitsProps) {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [pricing, setPricing] = useState<ProPricing | null>(null);
  const [loading, setLoading] = useState(true);

  const grouped = useMemo(() => {
    const map = new Map<string, Benefit[]>();
    for (const b of benefits) {
      if (!map.has(b.category)) map.set(b.category, []);
      map.get(b.category)!.push(b);
    }
    return map;
  }, [benefits]);

  const categoryColors = useMemo(() => {
    const map = new Map<string, (typeof PALETTE)[number]>();
    let idx = 0;
    for (const cat of grouped.keys()) {
      map.set(cat, PALETTE[idx % PALETTE.length]);
      idx++;
    }
    return map;
  }, [grouped]);

  useEffect(() => {
    async function fetchBenefits() {
      try {
        const res = await fetch("/api/premium/benefits");
        const data = await res.json();
        if (data.success && data.benefits) {
          setBenefits(data.benefits);
        }
        if (data.pricing?.pro) {
          setPricing(data.pricing.pro);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchBenefits();
  }, []);

  return (
    <Card className="border-purple-500/20 bg-zinc-950/50 overflow-visible">
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
                {pricing?.cost ?? 20} Cores / {pricing?.period ?? "week"}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 bg-zinc-900/50 text-[10px] font-black uppercase tracking-widest text-zinc-500">
        <div className="col-span-5">Feature</div>
        <div className="col-span-3 text-center">Free</div>
        <div className="col-span-4 text-center text-purple-400">Pro</div>
      </div>

      {/* Table Body */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div>
          {Array.from(grouped.entries()).map(([category, items], _catIdx) => {
            const colors = categoryColors.get(category) ?? PALETTE[0];
            return (
              <div key={category}>
                {/* Category Header */}
                <div
                  className={cn(
                    "px-4 py-2 border-b border-white/5 border-l-2",
                    colors.accent,
                    colors.bg
                  )}
                >
                  <span className={cn("text-[11px] font-bold uppercase tracking-wider", colors.text)}>
                    {category}
                  </span>
                </div>

                {/* Category Items */}
                {items.map((item) => (
                  <div
                    key={item.name}
                    className="group grid grid-cols-12 gap-2 px-4 py-2.5 items-center text-xs transition-colors hover:bg-white/[0.02] border-b border-white/[0.03]"
                  >
                    {/* Feature Name */}
                    <div className="col-span-5 flex items-center gap-2">
                      <span className="text-zinc-400 group-hover:text-zinc-300 transition-colors">
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
                          <span className="text-xs text-zinc-700">—</span>
                        )
                      ) : (
                        <span className="font-mono text-xs text-zinc-500">
                          {item.free}
                        </span>
                      )}
                    </div>

                    {/* Pro Value */}
                    <div className="col-span-4 text-center flex items-center justify-center">
                      {typeof item.pro === "boolean" ? (
                        item.pro ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <X className="w-4 h-4 text-zinc-700" />
                        )
                      ) : (
                        <span className="text-purple-400 font-bold">
                          {item.pro}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
