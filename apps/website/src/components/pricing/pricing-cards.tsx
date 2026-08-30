"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CorePackage, PricingData } from "@/types/pricing";
import { Audiowide } from "next/font/google";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export interface PricingCardsProps {
  packages: CorePackage[];
  pricingData?: PricingData | null;
  onPayment: (packageId: string, amount: number) => void;
  loadingPackageId: string | null;
  isLoading?: boolean;
}

export function PricingCards({
  packages,
  onPayment,
  loadingPackageId,
  isLoading = false,
}: PricingCardsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 bg-zinc-950/40 rounded-2xl animate-skeleton-glitch border border-white/5"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {packages.map((pkg) => {
        const isProcessing = loadingPackageId === pkg.id;
        const bonusPercent =
          pkg.bonusCores > 0
            ? Math.round((pkg.bonusCores / pkg.baseCores) * 100)
            : 0;

        return (
          <button
            key={pkg.id}
            onClick={() => onPayment(pkg.id, pkg.price)}
            disabled={
              isProcessing || (loadingPackageId !== null && !isProcessing)
            }
            className={cn(
              "w-full flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 group relative overflow-hidden cursor-pointer",
              "bg-zinc-950/40 border-white/5 hover:border-cyan-500/30 hover:bg-zinc-900/60",
              "hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]",
              isProcessing && "opacity-80 cursor-wait",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {/* Background Tech Pattern */}
            <div className="absolute inset-x-0 bottom-0 h-full bg-linear-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Left Side: Price & Badge */}
            <div className="flex flex-col items-start gap-0.5 z-10">
              {bonusPercent > 0 && (
                <div className="px-1.5 py-0 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] font-black uppercase tracking-wider mb-0.5">
                  +{bonusPercent}% Bonus
                </div>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-zinc-500 text-[10px] font-bold">$</span>
                <span
                  className={cn(
                    "text-xl font-black text-white tracking-widest leading-none",
                    audiowide.className
                  )}
                >
                  {pkg.price}
                </span>
                <span className="text-[8px] uppercase font-black text-zinc-600 tracking-[0.2em] ml-0.5">
                  USD
                </span>
              </div>
            </div>

            {/* Right Side: Cores */}
            <div className="flex flex-col items-end z-10">
              {bonusPercent > 0 && (
                <div className="text-[9px] text-zinc-600 line-through font-black mb-0.5 opacity-60 tracking-widest">
                  {pkg.baseCores}
                </div>
              )}
              <div className="flex items-center gap-2">
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                ) : (
                  <>
                    <span
                      className={cn(
                        "text-lg font-black tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]",
                        audiowide.className
                      )}
                    >
                      {pkg.totalCores}
                    </span>
                    <div className="relative group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src="/images/cores/core_energy.png"
                        width={20}
                        height={20}
                        alt="Cores"
                        className="drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
