"use client";

import { useState, useEffect } from "react";
import { Settings, Activity } from "lucide-react";
import { Audiowide } from "next/font/google";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { calculateSubscriptionProgress } from "@/lib/premium-utils";
import { StatusModule } from "./status-module";
import { DangerZoneModule } from "./danger-zone-module";
import type { ProEngineSettings as ProEngineSettingsType } from "@/store/use-pro-engine-store";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface ProEngineSettingsProps {
  guildId: string;
  premiumStatus: ProEngineSettingsType;
  isCancelled: boolean;
  onSubscriptionCancelled: () => void;
}

export function ProEngineSettings({
  guildId,
  premiumStatus,
  isCancelled,
  onSubscriptionCancelled,
}: ProEngineSettingsProps) {
  const [, forceUpdate] = useState({});
  const [autoDeduct, setAutoDeduct] = useState(
    premiumStatus?.settings?.autoDeductFromOwner ?? false
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Real-time countdown update for the remaining time display
  useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate({});
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Sync autoDeduct state with premiumStatus changes
  useEffect(() => {
    setAutoDeduct(premiumStatus?.settings?.autoDeductFromOwner ?? false);
  }, [premiumStatus?.settings?.autoDeductFromOwner]);

  // Calculate detailed remaining time using reusable utility
  const subData = calculateSubscriptionProgress(
    premiumStatus?.subscription?.expiresAt ?? undefined,
    premiumStatus?.subscription?.lastDeductionDate ?? undefined,
    premiumStatus?.premiumConfig?.PRO?.periodDays ?? 7
  );

  const {
    days: daysRem,
    hours: hoursRem,
    minutes: minutesRem,
    progress: progressPercent,
  } = subData;

  // Determine if cancelled
  const showCancelledState = isCancelled;

  const handleAutoDeductToggle = async () => {
    setIsUpdating(true);
    try {
      const newValue = !autoDeduct;
      const res = await fetch(`/api/guilds/${guildId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoDeductFromOwner: newValue }),
      });

      if (res.ok) {
        setAutoDeduct(newValue);
      }
    } catch (error) {
      console.error("Failed to update auto-deduct setting:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (showCancelledState) {
    return null;
  }

  return (
    <div className="relative group">
      {/* Ambient Glow */}
      <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500/20 via-purple-500/10 to-transparent rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />

      <Card
        variant="cyberpunk"
        showGrid
        className="border-cyan-500/10 shadow-[0_0_50px_-12px_rgba(6,182,212,0.1)] rounded-3xl"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

        <CardContent className="p-5 sm:p-7 space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between pb-5 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-2 sm:p-2.5 bg-zinc-900/50 rounded-xl border border-white/10 shadow-inner">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 animate-[spin_10s_linear_infinite]" />
              </div>
              <div className="space-y-0.5">
                <h3
                  className={cn(
                    "text-xs sm:text-sm font-black text-white tracking-widest uppercase flex items-center gap-2",
                    audiowide.className
                  )}
                >
                  System Configuration
                </h3>
                <p className="text-[9px] sm:text-[10px] text-zinc-500 font-mono tracking-wide">
                  SERVER ID: <span className="text-zinc-400">{guildId}</span>
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono text-emerald-500/80 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
              <Activity className="w-2.5 h-2.5" />
              SYSTEM ONLINE
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* Left: Status Module */}
            <StatusModule
              daysRem={daysRem}
              hoursRem={hoursRem}
              minutesRem={minutesRem}
              progressPercent={progressPercent}
            />

            {/* Right: Danger/Action Module */}
            <DangerZoneModule
              guildId={guildId}
              premiumStatus={premiumStatus}
              onSubscriptionCancelled={onSubscriptionCancelled}
            />
          </div>

          {/* Auto-Fuel Setting */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-white tracking-widest uppercase">
                  Auto-Fuel
                </h4>
                <p className="text-[10px] text-zinc-500 font-mono">
                  If vault is empty, owner&apos;s balance is used automatically
                </p>
              </div>
              <button
                onClick={handleAutoDeductToggle}
                disabled={isUpdating}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none",
                  autoDeduct
                    ? "bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    : "bg-zinc-700",
                  isUpdating && "opacity-50 cursor-not-allowed"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                    autoDeduct ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
