"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useCoreBalance, type BalanceData } from "@/hooks/use-core-balance";
import { PricingDialog } from "@/components/pricing/pricing-dialog";
import { Button } from "@/components/ui/button";

import { audiowide } from "@/lib/fonts";

export interface CoreBalanceProps {
  /** Visual variant */
  variant?: "compact" | "full" | "dropdown";
  /** Custom className */
  className?: string;
  /** Core image URL */
  coreImageUrl?: string;
  /** Custom onClick handler (overrides default pricing modal) */
  onClick?: () => void;
  /** Whether to show the plus button */
  showPlusButton?: boolean;
  /** SSR seed so the chip paints with real numbers before hydration */
  initialData?: BalanceData | null;
}

export function CoreBalance({
  variant = "full",
  className,
  coreImageUrl = "/images/core_energy.png",
  onClick,
  showPlusButton = true,
  initialData,
}: CoreBalanceProps) {
  const { status } = useSession();
  const { cores, sparks, isLoading } = useCoreBalance(initialData);

  // Round Cores to 2 decimal places for financial precision, format Sparks as whole integer
  const roundedCores = cores ? Math.round(cores * 100) / 100 : 0;
  const displayCores = roundedCores.toFixed(2);
  const displaySparks = Math.floor(sparks ?? 0).toLocaleString();

  if (status === "unauthenticated") return null;

  // With an SSR seed, show real numbers immediately — don't wait on session hydration.
  const showSkeleton =
    !initialData && (status === "loading" || isLoading);

  // Loading state skeleton
  if (showSkeleton) {
    if (variant === "compact") {
      return (
        <div
          className={cn(
            "h-5 w-12 bg-zinc-800/10 animate-pulse rounded-full",
            className
          )}
        />
      );
    }
    if (variant === "dropdown") {
      return (
        <div
          className={cn(
            "mt-2 h-14.5 w-full bg-zinc-900/50 animate-pulse rounded-lg border border-border/40",
            className
          )}
        />
      );
    }
    return (
      <div
        className={cn(
          "h-8 w-28 sm:w-44 bg-zinc-900/60 border border-white/5 animate-pulse rounded-full backdrop-blur-md shrink-0",
          className
        )}
      />
    );
  }

  // Dropdown variant (for user menu dropdown)
  if (variant === "dropdown") {
    return (
      <div
        className={cn(
          "mt-2 p-3 bg-zinc-950 border border-white/10 rounded-lg flex items-center justify-between shadow-2xl group/card relative overflow-hidden transition-all hover:border-cyan-500/40 hover:bg-zinc-900/80 cursor-pointer",
          className
        )}
      >
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
            {coreImageUrl && (
              <Image
                src={coreImageUrl}
                width={28}
                height={28}
                alt="Cores"
                draggable={false}
                className="select-none drop-shadow-[0_0_5px_rgba(0,255,255,0.4)]"
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              Core &amp; Sparks
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={cn(
                  "text-base font-black leading-tight text-white flex items-center gap-1",
                  audiowide.className
                )}
              >
                <Image
                  src="/images/core_energy.png"
                  width={16}
                  height={16}
                  alt="Cores"
                  className="inline-block shrink-0"
                />
                {displayCores}
              </span>
              <span
                className={cn(
                  "text-xs font-bold leading-tight text-amber-400 flex items-center gap-1",
                  audiowide.className
                )}
              >
                <Image
src="/images/spark_energy.png"
                  width={14}
                  height={14}
                  alt="Sparks"
                  className="inline-block shrink-0"
                />
                {displaySparks}
              </span>
            </div>
          </div>
        </div>
        {showPlusButton && (
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/5 hover:border-cyan-500/50 hover:text-cyan-400 rounded-lg shrink-0 transition-all active:scale-95 group/btn shadow-lg relative z-20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick?.();
            }}
            title="Add Cores"
          >
            <Plus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          </Button>
        )}
      </div>
    );
  }

  // Compact variant (for header)
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 group cursor-pointer",
          className
        )}
      >
        {coreImageUrl && (
          <Image
            src={coreImageUrl}
            width={20}
            height={20}
            alt="Cores"
            draggable={false}
            className="select-none drop-shadow-[0_0_5px_rgba(0,255,255,0.4)] group-hover:scale-110 transition-transform"
          />
        )}
        <span
          className={cn(
            "font-black text-sm tracking-widest text-zinc-300 group-hover:text-white transition-colors mt-0.5",
            audiowide.className,
            isLoading && "opacity-50 animate-pulse"
          )}
        >
          {isLoading ? "..." : displayCores}
        </span>
        {showPlusButton &&
          (onClick ? (
            <div
              className="bg-cyan-500/10 border border-cyan-500/20 rounded-md p-0.5 ml-1 cursor-pointer hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all text-cyan-400"
              onClick={onClick}
            >
              <Plus className="w-3 h-3" />
            </div>
          ) : (
            <PricingDialog
              trigger={
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-md p-0.5 ml-1 cursor-pointer hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all text-cyan-400">
                  <Plus className="w-3 h-3" />
                </div>
              }
            />
          ))}
      </div>
    );
  }

  // Full variant (for dashboard header)
  return (
    <div
      className={cn(
        "flex items-center bg-zinc-950/60 border border-white/10 rounded-full px-1.5 py-1 gap-2 backdrop-blur-xl hover:border-cyan-500/30 transition-all group shadow-2xl relative shrink-0",
        className
      )}
    >
      {/* Inner Glow */}
      <div className="absolute inset-0 rounded-full bg-linear-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Cores Section */}
      <div className="flex items-center gap-1.5 pl-0.5">
        {/* Core Icon with Neon Glow */}
        <div className="relative w-5 h-5 shrink-0">
          <Image
            src={coreImageUrl}
            alt="Cores"
            fill
            sizes="20px"
            className="object-contain drop-shadow-[0_0_8px_rgba(0,255,255,0.6)] group-hover:scale-110 transition-transform"
          />
        </div>
        {/* Core Number */}
        <span
          className={cn(
            "font-bold text-sm tracking-widest min-w-5 text-center z-10",
            audiowide.className,
            isLoading ? "opacity-50 animate-pulse text-zinc-500" : "text-white"
          )}
        >
          {isLoading ? "0" : displayCores}
        </span>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-4 bg-white/10 shrink-0" />

      {/* Sparks Section */}
      <div className="hidden sm:flex items-center gap-1">
        <div className="relative w-4 h-4 shrink-0">
          <Image
            src="/images/spark_energy.png"
            alt="Sparks"
            fill
            sizes="16px"
            className="object-contain drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
          />
        </div>
        <span
          className={cn(
            "font-bold text-xs tracking-wider z-10",
            audiowide.className,
            isLoading ? "opacity-50 animate-pulse text-zinc-500" : "text-amber-400"
          )}
        >
          {isLoading ? "0" : displaySparks}
        </span>
      </div>

      {/* Plus Button - Tech Style */}
      {showPlusButton &&
        (onClick ? (
          <div
            className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-pointer shadow-xl active:scale-95 group/btn"
            onClick={onClick}
          >
            <Plus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          </div>
        ) : (
          <PricingDialog
            trigger={
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-pointer shadow-xl active:scale-95 group/btn">
                <Plus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              </div>
            }
          />
        ))}
    </div>
  );
}
