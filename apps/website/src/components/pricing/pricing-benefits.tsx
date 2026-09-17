"use client";

import { useMemo } from "react";
import { Zap, Shield, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { CyberpunkBackground } from "@/components/common/cyberpunk-background";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const HIGHLIGHTS = [
  {
    icon: Zap,
    text: "Unlock All Premium Features",
    color: "text-cyan-400",
    glow: "rgba(34,211,238,0.4)",
  },
  {
    icon: Shield,
    text: "Priority Processing & Dedicated Support",
    color: "text-emerald-400",
    glow: "rgba(52,211,153,0.4)",
  },
  {
    icon: Trophy,
    text: "Up to 20x Higher Limits on All Systems",
    color: "text-fuchsia-400",
    glow: "rgba(232,121,249,0.4)",
  },
];

const PALETTE = [
  "text-cyan-400",
  "text-pink-400",
  "text-emerald-400",
  "text-purple-400",
  "text-amber-400",
  "text-red-400",
  "text-blue-400",
  "text-orange-400",
  "text-teal-400",
  "text-indigo-400",
];

interface Benefit {
  name: string;
  category: string;
  type: "limit" | "feature";
  free: string | boolean;
  pro: string | boolean;
}

export function PricingBenefits() {
  const { data } = useSWR("/api/premium/benefits", fetcher, {
    revalidateOnFocus: false,
  });

  const benefits: Benefit[] = data?.benefits || [];

  const { grouped, categoryIndexMap } = useMemo(() => {
    const g = new Map<string, Benefit[]>();
    const map = new Map<string, number>();
    let idx = 0;
    for (const b of benefits) {
      if (!g.has(b.category)) g.set(b.category, []);
      g.get(b.category)!.push(b);
      if (!map.has(b.category)) {
        map.set(b.category, idx++);
      }
    }
    return { grouped: g, categoryIndexMap: map };
  }, [benefits]);

  return (
    <div className="relative mx-6 mb-3 p-4 rounded-2xl border border-white/10 bg-zinc-950/50 overflow-visible group backdrop-blur-md">
      <CyberpunkBackground
        gridSize={24}
        gridOpacity={0.04}
        gridColor="#00ffff"
        showGlows={true}
        primaryGlow="rgba(6, 182, 212, 0.15)"
        secondaryGlow="rgba(217, 70, 239, 0.12)"
        showNoise={true}
        showScanlines={false}
        showGlitchLines={true}
      />

      <div className="relative z-10">
        {/* Quick highlights */}
        <ul className="space-y-2 mb-4">
          {HIGHLIGHTS.map((benefit) => (
            <li
              key={benefit.text}
              className="flex items-center gap-3 text-white group/item select-none"
            >
              <div
                className={cn(
                  benefit.color,
                  `drop-shadow-[0_0_8px_${benefit.glow}]`
                )}
              >
                <benefit.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300 group-hover/item:text-white transition-colors">
                {benefit.text}
              </span>
            </li>
          ))}
        </ul>

        {/* Detailed benefits table */}
        {benefits.length > 0 && (
          <div className="border-t border-white/10 pt-3 mt-3">
            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Free vs Pro Comparison
            </div>
            <div className="space-y-3">
              {Array.from(grouped.entries()).map(([category, items]) => (
                <div key={category}>
                  <div
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider mb-1.5 pb-1 border-b border-white/5",
                      PALETTE[categoryIndexMap.get(category) ?? 0] || "text-zinc-400"
                    )}
                  >
                    {category}
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-[10px] py-0.5"
                      >
                        <span className="text-zinc-400">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-500 w-14 text-right font-mono">
                            {typeof item.free === "boolean"
                              ? item.free
                                ? "✓"
                                : "—"
                              : item.free}
                          </span>
                          <span className="text-purple-400 font-medium w-14 text-right font-mono">
                            {typeof item.pro === "boolean"
                              ? item.pro
                                ? "✓"
                                : "—"
                              : item.pro}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
