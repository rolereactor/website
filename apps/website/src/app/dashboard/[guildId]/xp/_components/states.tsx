"use client";

import { Audiowide } from "next/font/google";
import { Trophy, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

import { CyberpunkBackground } from "@/components/common/cyberpunk-background";

export function XPDisabledState({ onEnable }: { onEnable: () => void }) {
  return (
    <Card
      variant="cyberpunk"
      className="relative overflow-hidden min-h-112.5 w-full group flex flex-col items-center justify-center"
    >
      <CyberpunkBackground
        showGrid={true}
        gridColor="#f43f5e"
        gridOpacity={0.03}
        showScanlines={true}
        showNoise={true}
        primaryGlow="rgba(244, 63, 94, 0.12)"
        secondaryGlow="rgba(244, 63, 94, 0.05)"
      />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 py-12">
        {/* Status Badge */}
        <div className="mb-12">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
            <span
              className={cn(
                "text-[10px] font-black text-red-500 uppercase tracking-[0.2em] whitespace-nowrap",
                audiowide.className
              )}
            >
              Module Status: Offline
            </span>
          </div>
        </div>

        {/* Power-Off Icon Container */}
        <div className="relative mb-8 group-hover:scale-105 transition-transform duration-700">
          {/* Outermost pulsing glow */}
          <div className="absolute -inset-12 bg-red-500/15 blur-[80px] rounded-full animate-pulse" />

          {/* Orbiting ring - slow rotation */}
          <div className="absolute -inset-6 animate-[spin_12s_linear_infinite]">
            <div className="w-full h-full rounded-full border border-dashed border-red-500/15" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          </div>

          {/* Middle orbiting ring - reverse */}
          <div className="absolute -inset-3 animate-[spin_8s_linear_infinite_reverse]">
            <div className="w-full h-full rounded-full border border-red-500/10" />
            <div className="absolute bottom-0 right-0 w-1 h-1 rounded-full bg-red-400/50 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
          </div>

          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Concentric rings */}
            <div className="absolute inset-0 rounded-full border border-red-500/10 group-hover:border-red-500/25 transition-colors duration-700" />
            <div className="absolute inset-3 rounded-full border border-red-500/15 group-hover:border-red-500/30 transition-colors duration-500" />

            {/* Core icon */}
            <div className="relative w-16 h-16 rounded-full bg-zinc-950 border-2 border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.15),inset_0_0_20px_rgba(239,68,68,0.05)] group-hover:border-red-500/50 group-hover:shadow-[0_0_40px_rgba(239,68,68,0.25),inset_0_0_25px_rgba(239,68,68,0.1)] transition-all duration-700">
              {/* Inner gradient overlay */}
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(239,68,68,0.1)_0%,transparent_70%)]" />

              {/* Scan-line effect */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="w-full h-0.5 bg-red-500/20 animate-[scan_3s_ease-in-out_infinite]" />
              </div>

              <Lock className="w-6 h-6 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)] relative z-10" />
            </div>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="space-y-4 mb-10 w-full flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-6 w-full max-w-lg relative">
            {/* Balanced Decorative Lines */}
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-red-500/40 to-red-500/10" />
            <h3
              className={cn(
                "text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-sm whitespace-nowrap px-4",
                audiowide.className
              )}
            >
              XP System Offline
            </h3>
            <div className="h-px flex-1 bg-linear-to-l from-transparent via-red-500/40 to-red-500/10" />
          </div>
          <p className="text-zinc-400 font-medium text-sm leading-relaxed max-w-md mx-auto">
            Neural tracking for this server is currently inactive. Initialize
            the module to start recording user engagement and awarding
            experience points.
          </p>
        </div>

        {/* Action Button */}
        <div className="relative group/btn">
          <div className="absolute -inset-4 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          <Button
            variant="cyber"
            size="lg"
            onClick={onEnable}
            className="h-14 px-10 relative z-10"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 fill-black" />
              <span
                className={cn(
                  "text-sm font-black uppercase tracking-[0.2em]",
                  audiowide.className
                )}
              >
                Initialize System
              </span>
            </div>
          </Button>
        </div>
      </div>

      {/* Background Decorative */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-red-500/20 to-transparent" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-600/5 blur-3xl pointer-events-none" />
    </Card>
  );
}

export function EmptyState() {
  return (
    <Card
      variant="cyberpunk"
      className="relative overflow-hidden min-h-112.5 group"
      contentClassName="flex flex-col items-center justify-center p-8 text-center grow"
      showGrid={true}
    >
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8">
          <div className="absolute -inset-10 bg-cyan-500/10 blur-[60px] rounded-full" />
          <div className="relative w-24 h-24 rounded-3xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-2xl group-hover:border-cyan-500/30 transition-colors duration-500">
            <Trophy className="w-10 h-10 text-cyan-500" />
          </div>
        </div>

        <div className="space-y-3 max-w-sm">
          <h3
            className={cn(
              "text-3xl font-black text-white uppercase tracking-widest",
              audiowide.className
            )}
          >
            No Rankings
          </h3>
          <p className="text-zinc-500 font-medium text-sm leading-relaxed">
            The database is currently clear. Rankings will propagate as users
            synchronize with the engagement network.
          </p>
        </div>
      </div>
    </Card>
  );
}
