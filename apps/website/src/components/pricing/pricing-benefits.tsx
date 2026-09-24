"use client";

import { Zap, Shield, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { CyberpunkBackground } from "@/components/common/cyberpunk-background";

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
    text: "Up to 10x Higher Limits",
    color: "text-fuchsia-400",
    glow: "rgba(232,121,249,0.4)",
  },
];

export function PricingBenefits() {
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
        <ul className="space-y-2">
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
      </div>
    </div>
  );
}
