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

/**
 * Rate card tiers matching the bot's calculateCores() function
 * Base rate: 15 cores/$, bonuses increase with donation amount
 */
const rateCard = [
  { min: 5, max: 9, rate: 15, bonus: 0 },
  { min: 10, max: 24, rate: 16.5, bonus: 10 },
  { min: 25, max: 49, rate: 17.4, bonus: 16 },
  { min: 50, max: 99, rate: 18, bonus: 20 },
  { min: 100, max: Infinity, rate: 22, bonus: 47 },
];

export function BmacPaymentView({ onBack, onComplete }: BmacPaymentViewProps) {
  const [data, setData] = useState<BmacData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedName, setCopiedName] = useState(false);

  useEffect(() => {
    const generateCode = async () => {
      try {
        const response = await fetch("/api/payments/buymeacoffee", {
          method: "POST",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Failed to generate code"
          );
        }

        const result = await response.json();
        if (result.success && result.data) {
          setData(result.data);
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate code"
        );
        toast.error("Failed to generate payment code");
      } finally {
        setLoading(false);
      }
    };

    generateCode();
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
            {rateCard.map((tier, index) => (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                <span className="text-[11px] text-zinc-400 font-medium">
                  ${tier.min}
                  {tier.max !== Infinity ? `–${tier.max}` : '+'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-cyan-400">
                    {tier.rate} cores/$
                  </span>
                  {tier.bonus > 0 && (
                    <span className="text-[9px] text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded-full">
                      +{tier.bonus}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
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
