"use client";

import { Zap, Lock, AlertTriangle, Clock } from "lucide-react";
import { Audiowide } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CyberpunkBackground } from "@/components/common/cyberpunk-background";
import { StatePanel } from "@/components/common/state-panel";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface ProEngineActiveAlertProps {
  isCancelled: boolean;
  expiresAt?: string;
}

export function ProEngineActiveAlert({
  isCancelled,
  expiresAt,
}: ProEngineActiveAlertProps) {
  return (
    <Card className="relative overflow-hidden border-white/5 bg-zinc-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-1/3 bg-cyan-500/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8">
        <div className="space-y-2 max-w-2xl min-w-0 w-full">
          <h3
            className={cn(
              "text-xl font-black uppercase tracking-widest text-white flex items-center gap-3",
              audiowide.className
            )}
          >
            PRO ENGINE CORE
          </h3>
          <p className="text-sm font-medium text-zinc-500 leading-relaxed wrap-break-word">
            {isCancelled ? (
              <>
                Your Pro Engine features are still active. You have full access
                to all premium capabilities until your current period ends on{" "}
                <span className="text-white">
                  {expiresAt ? new Date(expiresAt).toLocaleDateString() : "TBD"}
                </span>
                .
              </>
            ) : (
              "The Pro Engine is active. All premium automated tools and server management features are currently available."
            )}
          </p>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0 w-full sm:w-auto">
          <div className="px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 shadow-[0_0_10px_cyan]"></span>
            </div>
            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
              PRO ACTIVE
            </span>
          </div>
          {isCancelled && (
            <div className="flex items-center gap-2 text-[10px] font-black text-amber-500/80 uppercase tracking-wider bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10">
              <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
              Ending Soon
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

interface ProEngineLockedAlertProps {
  onUnlock: () => void;
}

export function ProEngineLockedAlert({ onUnlock }: ProEngineLockedAlertProps) {
  return (
    <Card
      className="relative overflow-hidden border-amber-500/20 bg-zinc-950 group cursor-pointer hover:border-amber-500/40 transition-all duration-500"
      onClick={onUnlock}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-1/3 bg-amber-500/5 blur-[80px] pointer-events-none group-hover:bg-amber-500/10 transition-all" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8">
        <div className="flex items-center gap-5 w-full min-w-0">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0 group-hover:scale-110 group-hover:bg-amber-500/20 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all duration-500">
            <Lock className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "text-base font-black text-amber-500 tracking-wider mb-1 truncate",
                audiowide.className
              )}
            >
              PRO ENGINE LOCKED
            </h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider group-hover:text-zinc-400 transition-colors wrap-break-word">
              Enable Pro Engine to unlock advanced server management
              capabilities.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer hidden sm:flex shrink-0 font-black uppercase text-[10px] bg-transparent border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-zinc-950 hover:border-amber-500 shadow-[0_0_0_rgba(245,158,11,0)] hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all duration-300"
          >
            Unlock Now
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface ProEngineCancelledAlertProps {
  expiresAt: string;
  cost?: number;
  period?: string;
  newCost?: number;
  newPeriod?: string;
  progress?: number;
  onReactivate: () => void;
}

export function ProEngineCancelledAlert({
  expiresAt,
  cost,
  period,
  newCost,
  newPeriod,
  progress = 100,
  onReactivate,
}: ProEngineCancelledAlertProps) {
  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-black/40 backdrop-blur-md group/cancelled transition-all duration-500 hover:border-cyan-400/40 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.2)]">
        {/* HQ HUD Background */}
        <CyberpunkBackground
          gridSize={24}
          gridOpacity={0.05}
          primaryGlow="rgba(6, 182, 212, 0.05)"
          secondaryGlow="rgba(59, 130, 246, 0.05)"
          glowOpacity={0.4}
          className="z-0"
        />

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-size-[100%_4px,3px_100%] opacity-20" />

        <div className="relative z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1 min-w-0">
            <div className="relative shrink-0 group-hover/cancelled:scale-105 transition-transform duration-500">
              <div className="absolute -inset-3 bg-cyan-500/20 blur-xl opacity-0 group-hover/cancelled:opacity-100 transition-opacity" />
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 relative">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    "text-sm font-black text-cyan-400 uppercase tracking-[0.2em]",
                    audiowide.className
                  )}
                >
                  Cancellation Pending
                </h3>
                <div className="h-px flex-1 bg-linear-to-r from-cyan-500/40 to-transparent" />
              </div>
              <p className="text-[11px] font-bold text-zinc-400 leading-relaxed uppercase tracking-wider max-w-2xl">
                You will keep all Pro features until{" "}
                <span className="text-white">
                  {new Date(expiresAt).toLocaleDateString()}
                </span>
                . If you change your mind, you can re-enable auto-renew for{" "}
                <span className="text-cyan-400">
                  {newCost || cost || 20} Cores/{newPeriod || period || "week"}
                </span>
                .
              </p>
            </div>
          </div>

          <Button
            variant="cyber"
            onClick={onReactivate}
            className="cursor-pointer h-12 px-8 shrink-0 w-full sm:w-auto group-hover/cancelled:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            <Zap className="mr-2 w-4 h-4" />
            Keep Pro Engine
          </Button>
        </div>

        {/* Bottom Status Bar - Functional Progress */}
        <div className="h-1 w-full bg-zinc-900 overflow-hidden relative">
          <div className="absolute inset-0 bg-cyan-500/20 animate-[shimmer_2s_infinite]" />
          <div
            className="absolute top-0 left-0 h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface LockedStateProps {
  onActivate: () => void;
}

export function LockedState({ onActivate }: LockedStateProps) {
  return (
    <StatePanel
      variant="locked"
      icon={Lock}
      title="Pro Engine Locked"
      description="No active subscription found. Activate Pro Engine to manage premium settings for this server."
    >
      <Button
        variant="cyber"
        onClick={onActivate}
        className="cursor-pointer h-14 px-10 tracking-widest mt-2"
      >
        Activate Now
        <Zap className="ml-2 w-4 h-4 fill-black group-hover:animate-pulse" />
      </Button>
    </StatePanel>
  );
}

interface ProEngineTrialAlertProps {
  trialEndsAt?: string;
  onUpgrade: () => void;
  coreCost?: number;
  corePeriod?: string;
}

export function ProEngineTrialAlert({
  trialEndsAt,
  onUpgrade,
  coreCost = 20,
  corePeriod = "week",
}: ProEngineTrialAlertProps) {
  const daysRemaining = trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <Card className="relative overflow-hidden border-emerald-500/20 bg-zinc-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-1/3 bg-emerald-500/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8">
        <div className="space-y-2 max-w-2xl min-w-0 w-full">
          <h3
            className={cn(
              "text-xl font-black uppercase tracking-widest text-white flex items-center gap-3",
              audiowide.className
            )}
          >
            FREE TRIAL ACTIVE
          </h3>
          <p className="text-sm font-medium text-zinc-500 leading-relaxed wrap-break-word">
            You&apos;re experiencing Pro Engine features for free.{" "}
            {daysRemaining > 0 ? (
              <>
                Your trial ends in{" "}
                <span className="text-emerald-400">
                  {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
                </span>
                . Subscribe now to keep all features uninterrupted.
              </>
            ) : (
              "Your trial has ended. Subscribe to Pro Engine to continue using premium features."
            )}
          </p>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0 w-full sm:w-auto">
          <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
              {daysRemaining > 0 ? `${daysRemaining}D LEFT` : "TRIAL ENDED"}
            </span>
          </div>
          <Button
            variant="cyber"
            onClick={onUpgrade}
            className="cursor-pointer font-black uppercase text-[10px] h-10 px-6"
          >
            <Zap className="w-4 h-4 mr-2" />
            SUBSCRIBE - {coreCost} CORES/{corePeriod.toUpperCase()}
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface ProEngineTrialExpiredAlertProps {
  onSubscribe: () => void;
  coreCost?: number;
  corePeriod?: string;
}

export function ProEngineTrialExpiredAlert({
  onSubscribe,
  coreCost = 20,
  corePeriod = "week",
}: ProEngineTrialExpiredAlertProps) {
  return (
    <Card className="relative overflow-hidden border-amber-500/20 bg-zinc-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-1/3 bg-amber-500/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8">
        <div className="space-y-2 max-w-2xl min-w-0 w-full">
          <h3
            className={cn(
              "text-xl font-black uppercase tracking-widest text-amber-500 flex items-center gap-3",
              audiowide.className
            )}
          >
            TRIAL EXPIRED
          </h3>
          <p className="text-sm font-medium text-zinc-500 leading-relaxed wrap-break-word">
            Your free trial has ended. Subscribe to Pro Engine to continue using
            premium features like advanced automod, unlimited level rewards, and
            more.
          </p>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0 w-full sm:w-auto">
          <div className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              EXPIRED
            </span>
          </div>
          <Button
            variant="glitch"
            data-text={`SUBSCRIBE - ${coreCost} CORES/${corePeriod.toUpperCase()}`}
            onClick={onSubscribe}
            className="cursor-pointer font-black uppercase text-[10px] h-10 px-6"
          >
            <Zap className="w-4 h-4 mr-2 fill-current" />
            SUBSCRIBE - {coreCost} CORES/{corePeriod.toUpperCase()}
          </Button>
        </div>
      </div>
    </Card>
  );
}
