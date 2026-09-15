"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Audiowide } from "next/font/google";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface BmacPaymentViewProps {
  onBack: () => void;
  onComplete: () => void;
}

interface BmacData {
  code: string;
  username: string;
  buyMeACoffeeUrl: string;
  expiresAt: string;
}

interface RateCardTier {
  price: number;
  name: string;
  totalCores: number;
  rate: number;
}

export function BmacPaymentView({ onBack, onComplete }: BmacPaymentViewProps) {
  const [data, setData] = useState<BmacData | null>(null);
  const [rateCard, setRateCard] = useState<RateCardTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedName, setCopiedName] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [codeRes, pricingRes] = await Promise.all([
          fetch("/api/payments/buymeacoffee", { method: "POST" }),
          fetch("/api/premium/benefits"),
        ]);

        if (!codeRes.ok) {
          const errorData = await codeRes.json();
          throw new Error(
            errorData.error?.message || "Failed to generate code"
          );
        }

        const codeResult = await codeRes.json();
        if (codeResult.success && codeResult.data) {
          setData(codeResult.data);
        } else {
          throw new Error("Invalid response from server");
        }

        const pricingResult = await pricingRes.json();
        if (pricingResult.success && pricingResult.pricing?.bmacRateCard) {
          setRateCard(pricingResult.pricing.bmacRateCard);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load"
        );
        toast.error("Failed to load payment data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const copyToClipboard = async (text: string, type: "code" | "name") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedName(true);
        setTimeout(() => setCopiedName(false), 2000);
      }
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-12 min-h-100">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-4" />
        <p className="text-xs text-zinc-500 uppercase tracking-widest">
          Generating your code...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-12 min-h-100">
        <p className="text-xs text-red-400 uppercase tracking-widest mb-4">
          {error || "Failed to load"}
        </p>
        <Button
          variant="secondary"
          onClick={onBack}
          className="rounded-xl cursor-pointer"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="px-6 py-4 flex-row items-center justify-between border-b border-white/5 bg-zinc-950/40 backdrop-blur-md shrink-0 rounded-t-2xl! space-y-0">
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
              Buy Me a Coffee
            </DialogTitle>
            <DialogDescription
              variant="glitch"
              className="text-[10px] opacity-60"
            >
              Donate any amount, get Cores
            </DialogDescription>
          </div>
        </div>
        <div className="text-lg">☕</div>
      </DialogHeader>

      <div className="p-5 space-y-4 overflow-y-auto flex-1 [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Rate Card */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">
            Rate Card
          </span>
          <div className="bg-zinc-950/40 rounded-xl border border-white/5 p-3 space-y-2">
            {rateCard.map((tier) => (
              <div
                key={tier.price}
                className="flex items-center justify-between"
              >
                <span className="text-[11px] text-zinc-400 font-medium">
                  ${tier.price} {tier.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-cyan-400">
                    {tier.totalCores} cores
                  </span>
                  <span className="text-[9px] text-zinc-500">
                    ({tier.rate}/$)
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-zinc-600 px-1">
            BMAC rates include platform fees. Crypto payments get full rate.
          </p>
        </div>

        {/* Unique Code */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">
            Your Unique Code
          </span>
          <div className="bg-zinc-950/40 rounded-xl border border-white/5 p-3 flex items-center justify-between">
            <span
              className={cn(
                "text-lg font-black text-white tracking-widest",
                audiowide.className
              )}
            >
              {data.code}
            </span>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-xl w-8 h-8 cursor-pointer"
              onClick={() => copyToClipboard(data.code, "code")}
            >
              {copiedCode ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Discord Name */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">
            Your Discord Name
          </span>
          <div className="bg-zinc-950/40 rounded-xl border border-white/5 p-3 flex items-center justify-between">
            <span className="text-sm font-bold text-white">
              {data.username}
            </span>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-xl w-8 h-8 cursor-pointer"
              onClick={() => copyToClipboard(data.username, "name")}
            >
              {copiedName ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">
            Steps
          </span>
          <div className="bg-zinc-950/40 rounded-xl border border-white/5 p-3 space-y-2">
            <div className="flex items-start gap-2 text-[11px] text-zinc-400">
              <span className="text-cyan-400 font-bold">1.</span>
              <span>Click &quot;Donate&quot; below</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-zinc-400">
              <span className="text-cyan-400 font-bold">2.</span>
              <span>Enter any dollar amount</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-zinc-400">
              <span className="text-cyan-400 font-bold">3.</span>
              <span>
                Put your Discord name in &quot;Name or @yoursocial&quot;
              </span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-zinc-400">
              <span className="text-cyan-400 font-bold">4.</span>
              <span>Paste code in &quot;Say something nice...&quot;</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-zinc-400">
              <span className="text-cyan-400 font-bold">5.</span>
              <span>Complete donation</span>
            </div>
          </div>
        </div>

        {/* Donate Button */}
        <a
          href={data.buyMeACoffeeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black transition-all cursor-pointer"
            onClick={() => {
              // Open in new tab
              window.open(
                data.buyMeACoffeeUrl,
                "_blank",
                "noopener,noreferrer"
              );
            }}
          >
            <span className="mr-2">☕</span>
            Donate on Buy Me a Coffee
            <ExternalLink className="w-3.5 h-3.5 ml-2" />
          </Button>
        </a>

        {/* Completed Button */}
        <Button
          variant="secondary"
          className="w-full h-10 rounded-xl font-black uppercase tracking-widest text-[10px] border border-white/5 cursor-pointer"
          onClick={onComplete}
        >
          I&apos;ve completed payment
        </Button>
      </div>
    </div>
  );
}
