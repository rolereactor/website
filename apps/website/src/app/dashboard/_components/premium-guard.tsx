"use client";

import { ReactNode, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Crown,
  CheckCircle2,
  Loader2,
  Zap,
  ExternalLink,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CyberpunkBackground } from "@/components/common/cyberpunk-background";

interface ProPricing {
  cost: number;
  period: string;
  periodDays: number;
}

interface PremiumGuardProps {
  isPremium?: boolean;
  children?: ReactNode;
  onActivate: () => void;
  onTrial?: () => void;
  showTrialOption?: boolean;
  isActivating?: boolean;
  title?: string;
  description?: string;
  features?: string[];
  buttonText?: string;
  subText?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PremiumGuard({
  onActivate,
  onTrial,
  showTrialOption = false,
  isActivating = false,
  title = "ACTIVATE PRO ENGINE",
  description = "Unlock full potential with our Pro functionalities.",
  features = [
    "Full Feature Access",
    "Priority Support",
    "No Restrictions",
    "Early Access",
  ],
  buttonText,
  subText,
  open,
  onOpenChange,
}: PremiumGuardProps) {
  const params = useParams();
  const guildId = params.guildId as string;

  const [pricing, setPricing] = useState<ProPricing | null>(null);

  useEffect(() => {
    fetch("/api/premium/benefits")
      .then((res) => res.json())
      .then((data) => {
        if (data.pricing?.pro) setPricing(data.pricing.pro);
      })
      .catch(() => {});
  }, []);

  const cost = pricing?.cost ?? 20;
  const periodDays = pricing?.periodDays ?? 7;
  const displayButtonText = buttonText ?? `UNLOCK FOR ${cost} CORES`;
  const displaySubText = subText ?? `Deducts ${cost} Cores every ${periodDays} days`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="glitch" className="max-w-115">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>

        {/* Animated Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <CyberpunkBackground
            gridSize={32}
            gridOpacity={0.02}
            gridColor="rgba(255,255,255,0.2)"
            mask="radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)"
            showGlows={true}
            primaryGlow="rgba(6, 182, 212, 0.15)"
            secondaryGlow="rgba(6, 182, 212, 0.1)"
          />
        </div>

        <DialogHeader className="px-8 pt-8 pb-4 relative overflow-hidden">
          {/* Enhanced Background Crown Glow */}
          <div className="absolute top-0 right-0 p-8 opacity-20 blur-2xl pointer-events-none animate-pulse">
            <Crown className="w-32 h-32 text-cyan-500" />
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-30 pointer-events-none">
            <Crown className="w-24 h-24 text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          </div>

          <div className="flex flex-col relative z-10">
            <DialogTitle variant="glitch" className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              {title}
            </DialogTitle>
            <DialogDescription variant="glitch" className="mt-3">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="px-8 pb-8 space-y-6 relative z-10">
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="bg-zinc-900/50 px-3 py-3 rounded-lg border border-white/5 flex items-center gap-2.5 hover:bg-zinc-800/50 hover:border-cyan-500/30 transition-all group/item backdrop-blur-sm"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover/item:bg-cyan-500/20 transition-colors border border-cyan-500/20 group-hover/item:border-cyan-500/40">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                </div>
                <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider truncate group-hover/item:text-white transition-colors">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Activation Button — Trial first, then cores */}
          {showTrialOption && onTrial ? (
            <Button
              variant="glitch"
              size="lg"
              data-text="START FREE TRIAL"
              disabled={isActivating}
              onClick={onTrial}
              className="w-full h-12"
            >
              {isActivating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Clock className="w-5 h-5 mr-3" />
                  START FREE TRIAL
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="glitch"
              size="lg"
              data-text={displayButtonText}
              disabled={isActivating}
              onClick={onActivate}
              className="w-full h-12"
            >
              {isActivating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-3 fill-current" />
                  {displayButtonText}
                </>
              )}
            </Button>
          )}

          <p className="text-[9px] text-zinc-500 text-center tracking-[0.3em] uppercase font-black opacity-60">
            {showTrialOption && onTrial
              ? "7 days free · No cores required · Cancel anytime"
              : displaySubText}
          </p>

          {/* Learn More Link */}
          {guildId && (
            <Link
              href={`/dashboard/${guildId}/pro-engine`}
              onClick={() => onOpenChange?.(false)}
              className="flex items-center justify-center gap-2 text-[10px] text-cyan-500 hover:text-cyan-400 font-bold uppercase tracking-widest transition-colors group/link hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
            >
              <span>Learn more about Pro Engine</span>
              <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
