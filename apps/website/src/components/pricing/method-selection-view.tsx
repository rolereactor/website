"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Coffee, Wallet, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { Audiowide } from "next/font/google";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { CorePackage } from "@/types/pricing";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface MethodSelectionViewProps {
  selectedPackage: CorePackage;
  onBack: () => void;
  onSelectMethod: (method: "plisio" | "web3" | "bmac") => void;
  playConfirm: () => void;
}

export function MethodSelectionView({
  selectedPackage,
  onBack,
  onSelectMethod,
  playConfirm,
}: MethodSelectionViewProps) {
  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="px-6 py-4 flex-row items-center justify-between border-b border-cyan-500/20 bg-zinc-950/40 backdrop-blur-md shrink-0 rounded-t-2xl space-y-0 relative overflow-hidden">
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
              Select Payment Method
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
          <div className="bg-black/40 rounded-xl border border-cyan-500/10 backdrop-blur-sm p-4 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-100/60 font-medium tracking-wide">
                Total Cores
              </span>
              <span className="text-cyan-400 font-black text-sm drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
                {selectedPackage.totalCores.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <span className="text-[10px] font-black text-cyan-500/70 tracking-widest uppercase mt-2 relative z-10">
            How would you like to pay?
          </span>

          <div className="flex flex-col gap-3 relative z-10">
            {/* Direct Web3 */}
            <button
              onClick={() => {
                playConfirm();
                onSelectMethod("web3");
              }}
              className="flex items-center justify-between w-full rounded-xl p-4 bg-zinc-950/40 backdrop-blur-sm border border-cyan-500/10 hover:border-blue-500/50 hover:bg-blue-500/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <Wallet className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-bold text-zinc-200 group-hover:text-blue-400 transition-colors tracking-wide">
                    Web3 Wallet (Instant)
                  </span>
                  <span className="text-xs text-blue-100/50 group-hover:text-blue-200/70 transition-colors mt-0.5">
                    Direct 1-click transfer via MetaMask
                  </span>
                </div>
              </div>
            </button>

            {/* Plisio */}
            <button
              onClick={() => {
                playConfirm();
                onSelectMethod("plisio");
              }}
              className="flex items-center justify-between w-full rounded-xl p-4 bg-zinc-950/40 backdrop-blur-sm border border-fuchsia-500/10 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10 hover:shadow-[0_0_20px_rgba(217,70,239,0.15)] transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 group-hover:bg-fuchsia-500/20 transition-colors">
                  <Coins className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-bold text-zinc-200 group-hover:text-fuchsia-400 transition-colors tracking-wide">
                    Multicoin Crypto Gateway
                  </span>
                  <span className="text-xs text-fuchsia-100/50 group-hover:text-fuchsia-200/70 transition-colors mt-0.5">
                    Pay with BTC, ETH, SOL, USDT from any exchange or wallet
                  </span>
                </div>
              </div>
            </button>

            {/* BMAC */}
            <button
              onClick={() => {
                playConfirm();
                onSelectMethod("bmac");
              }}
              className="flex items-center justify-between w-full rounded-xl p-4 bg-zinc-950/40 backdrop-blur-sm border border-amber-400/10 hover:border-amber-400/50 hover:bg-amber-400/10 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-amber-400/10 border border-amber-400/20 text-amber-400 group-hover:bg-amber-400/20 transition-colors">
                  <Coffee className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-bold text-zinc-200 group-hover:text-amber-400 transition-colors tracking-wide">
                    Credit / Debit Card
                  </span>
                  <span className="text-xs text-amber-100/50 group-hover:text-amber-200/70 transition-colors mt-0.5">
                    Visa, Mastercard, Apple Pay via Buy Me a Coffee
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
