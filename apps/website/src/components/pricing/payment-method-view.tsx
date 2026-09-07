"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Audiowide } from "next/font/google";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supportedCryptos } from "./constants";
import type { CorePackage } from "@/types/pricing";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface PaymentMethodViewProps {
  selectedPackage: CorePackage;
  onBack: () => void;
  onCryptoPayment: (currency: string, provider: string) => void;
  loadingCryptoId: string | null;
  playConfirm: () => void;
}

export function PaymentMethodView({
  selectedPackage,
  onBack,
  onCryptoPayment,
  loadingCryptoId,
  playConfirm,
}: PaymentMethodViewProps) {
  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="px-6 py-4 flex-row items-center justify-between border-b border-cyan-500/20 bg-zinc-950/40 backdrop-blur-md shrink-0 rounded-t-2xl! space-y-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-cyan-500/5 blur-xl pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-xl w-8 h-8 cursor-pointer bg-black/40 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/30 transition-all"
            onClick={onBack}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-100" />
          </Button>
          <div className="flex flex-col">
            <DialogTitle
              variant="glitch"
              className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"
            >
              Confirm Payment
            </DialogTitle>
            <DialogDescription
              variant="glitch"
              className="text-[10px] opacity-60 text-cyan-100"
            >
              {selectedPackage.name}
            </DialogDescription>
          </div>
        </div>
        <div
          className={cn(
            "text-xl font-black text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]",
            audiowide.className
          )}
        >
          ${selectedPackage.price}
        </div>
      </DialogHeader>

      <div className="p-5 space-y-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-cyan-500/70 tracking-widest uppercase">
            Order Summary
          </span>
          <div className="bg-black/40 rounded-xl border border-cyan-500/10 backdrop-blur-sm p-4 space-y-3 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-100/60 font-medium tracking-wide">
                Base Cores
              </span>
              <span className="text-white font-bold">
                {selectedPackage.baseCores.toLocaleString()}
              </span>
            </div>
            {selectedPackage.bonusCores > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-100/60 font-medium tracking-wide">
                  Bonus Cores
                </span>
                <span className="text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">
                  +{selectedPackage.bonusCores.toLocaleString()}
                </span>
              </div>
            )}
            <div className="h-px bg-cyan-500/10 w-full rounded-full" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-bold tracking-wide">
                Total Cores
              </span>
              <span className="text-cyan-400 font-black text-sm drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
                {selectedPackage.totalCores.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-cyan-500/40">
              <span className="uppercase tracking-widest font-semibold">
                Rate
              </span>
              <span className="font-mono">
                {selectedPackage.valuePerDollar}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          {/* Crypto Options */}
          <div className="flex flex-col gap-1.5 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <span className="text-[10px] font-black text-cyan-500/70 tracking-widest uppercase relative z-10">
              Pay with Crypto
            </span>
            {/* Using grid-cols-2 since we only have 5 coins now, which makes them bigger and more premium */}
            <div className="grid grid-cols-2 gap-3 h-60 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-1 pb-4 relative z-10">
              {supportedCryptos.map((crypto) => {
                const isCurrentLoading = loadingCryptoId === crypto.id;
                return (
                  <button
                    key={crypto.id}
                    className="flex flex-col items-center justify-center gap-3 rounded-xl group py-4 px-3 bg-zinc-950/40 border border-cyan-500/10 hover:border-cyan-500/40 hover:bg-cyan-950/20 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.02)] hover:shadow-[0_0_25px_rgba(6,182,212,0.1)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    onClick={() => {
                      playConfirm();
                      onCryptoPayment(crypto.id, "plisio");
                    }}
                    disabled={!!loadingCryptoId}
                  >
                    {isCurrentLoading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                    ) : (
                      <div
                        className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
                        style={{
                          backgroundColor: crypto.color,
                          boxShadow: `0 0 20px ${crypto.color}40`,
                        }}
                      >
                        <crypto.icon className="w-6 h-6" />
                      </div>
                    )}
                    <span className="text-[10px] font-black text-cyan-100/60 group-hover:text-white uppercase tracking-widest transition-colors">
                      {crypto.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[9px] text-center text-cyan-500/40 uppercase tracking-[0.2em] font-black">
            Crypto: delivered after network confirmation
          </p>
        </div>
      </div>
    </div>
  );
}
