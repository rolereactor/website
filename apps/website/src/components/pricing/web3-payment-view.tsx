"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Audiowide } from "next/font/google";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { CorePackage } from "@/types/pricing";
import { CryptoCheckout } from "@/components/crypto/crypto-checkout";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface Web3PaymentViewProps {
  selectedPackage: CorePackage;
  onBack: () => void;
  onSuccess: (hash: string) => void;
  playConfirm: () => void;
}

export function Web3PaymentView({
  selectedPackage,
  onBack,
  onSuccess,
  playConfirm,
}: Web3PaymentViewProps) {
  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="px-6 py-4 flex-row items-center justify-between border-b border-white/5 bg-zinc-950/40 backdrop-blur-md shrink-0 rounded-t-2xl space-y-0">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-xl w-8 h-8 cursor-pointer"
            onClick={onBack}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <div className="flex flex-col">
            <DialogTitle variant="glitch" className="text-sm">
              Web3 Checkout
            </DialogTitle>
            <DialogDescription
              variant="glitch"
              className="text-[10px] opacity-60"
            >
              {selectedPackage.name}
            </DialogDescription>
          </div>
        </div>
        <div
          className={cn("text-lg font-black text-white", audiowide.className)}
        >
          ${selectedPackage.price}
        </div>
      </DialogHeader>

      <div className="p-8 flex items-center justify-center">
        <CryptoCheckout
          packageId={selectedPackage.id}
          usdAmount={selectedPackage.price}
          receiverAddress={
            process.env.NEXT_PUBLIC_WEB3_RECEIVER_ADDRESS ||
            "0xC850f03295Bb614d52038FB83f78f72ed8f7c65d"
          }
          onSuccess={(hash) => {
            playConfirm();
            onSuccess(hash);
          }}
          className="w-full"
        />
      </div>
    </div>
  );
}
