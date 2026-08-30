"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Zap, Rocket, Coffee } from "lucide-react";
import { PricingBenefits } from "./pricing-benefits";
import { PricingCards } from "./pricing-cards";
import type { CorePackage, PricingData } from "@/types/pricing";

interface PackagesViewProps {
  packages: CorePackage[];
  pricingData: PricingData | null;
  onPaymentInitiation: (packageId: string) => void;
  onBMACPayment: () => void;
  loadingPackageId: string | null;
  loading: boolean;
}

export function PackagesView({
  packages,
  pricingData,
  onPaymentInitiation,
  onBMACPayment,
  loadingPackageId,
  loading,
}: PackagesViewProps) {
  return (
    <>
      <DialogHeader className="px-8 pt-8 pb-4 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl pointer-events-none">
          <Rocket className="w-24 h-24 text-cyan-500" />
        </div>
        <div className="flex flex-col relative z-10">
          <DialogTitle variant="glitch" className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            GET CORES
          </DialogTitle>
          <DialogDescription variant="glitch" className="mt-2">
            Select a package to upgrade your server capacity.
          </DialogDescription>
        </div>
      </DialogHeader>

      {/* Benefits Section */}
      <PricingBenefits />

      <div className="px-6 pb-6 pt-1 overflow-y-auto max-h-[50vh] [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <PricingCards
          packages={packages}
          pricingData={pricingData}
          onPayment={onPaymentInitiation}
          loadingPackageId={loadingPackageId}
          isLoading={loading && packages.length === 0}
        />

        <p className="text-[9px] text-zinc-600 text-center mt-4 px-4 leading-relaxed font-bold uppercase tracking-widest opacity-60">
          Secure Checkout via Encrypted Uplink.
          <br />
          Cores are non-refundable digital assets.
        </p>

        <div className="mt-4">
          <button
            onClick={onBMACPayment}
            className="flex items-center justify-center gap-3 w-full rounded-xl py-3 px-4 bg-zinc-900 border border-white/5 hover:border-amber-400/30 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <Coffee className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold text-zinc-300 group-hover:text-amber-400 transition-colors">
                Buy Me a Coffee
              </span>
              <span className="text-[10px] text-zinc-500">
                Support creator / Donate
              </span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
