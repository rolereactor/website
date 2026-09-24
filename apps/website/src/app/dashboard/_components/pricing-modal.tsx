"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { PricingBenefits } from "@/components/pricing/pricing-benefits";
import type { CorePackage } from "@/types/pricing";

import { usePricingStore } from "@/store/use-pricing-store";
import { useSession } from "next-auth/react";

interface PricingModalProps {
  trigger: ReactNode;
}

export function PricingModal({ trigger }: PricingModalProps) {
  const { data: session } = useSession();
  const { data, isLoading, fetchPricing } = usePricingStore();

  const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);
  const packages = data?.packages || [];
  const loading = isLoading;

  useEffect(() => {
    fetchPricing(session?.user?.id);
  }, [fetchPricing, session?.user?.id]);

  const router = useRouter();

  const handlePayment = (packageId: string, amount: number) => {
    setLoadingPackageId(packageId);

    // Find selected package to get details if needed, but we essentially just need values for URL
    const pkg = packages.find((p: CorePackage) => p.id === packageId);
    if (!pkg) return;

    const params = new URLSearchParams({
      package: packageId,
      amount: amount.toString(),
      cores: pkg.totalCores.toString(),
      name: pkg.name,
    });

    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-100 bg-black border-zinc-800 p-0 shadow-3xl gap-0 ring-1 ring-zinc-800/50">
        <DialogTitle className="sr-only">Purchase Core Balance</DialogTitle>
        <DialogDescription className="sr-only">
          Choose a package to top up your server's core balance and unlock
          premium features.
        </DialogDescription>

        <DialogHeader className="px-6 pt-8 pb-4">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-white tracking-tight leading-none">
              What's included
            </h3>
          </div>
        </DialogHeader>

        <PricingBenefits />

        <div className="px-4 pb-6 pt-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <PricingCards
            packages={packages}
            onPayment={handlePayment}
            loadingPackageId={loadingPackageId}
            isLoading={loading}
          />

          <p className="text-[10px] text-zinc-600 text-center mt-4 px-4 leading-tight">
            By buying Cores, you agree to our terms of service. Cores are
            non-refundable.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
