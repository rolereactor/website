"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  Copy,
  Check,
  Gift,
  Zap,
  TrendingUp,
  Award,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { audiowide } from "@/lib/fonts";

interface ReferralItem {
  refereeIdMasked: string;
  status: "pending" | "qualified";
  totalPurchased: number;
  referrerBonusEarned: number;
  createdAt: string;
  qualifiedAt: string | null;
}

interface ReferralData {
  referralCode: string;
  shareUrl: string;
  totalEarnedCores: number;
  hasClaimedCode?: boolean;
  stats: {
    totalInvites: number;
    qualifiedInvites: number;
    pendingInvites: number;
  };
  referrals: ReferralItem[];
}

export function ReferralSection() {
  const { data: session } = useSession();
  const [data, setData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [claimInputCode, setClaimInputCode] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);

  const fetchReferralInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/user/referral");
      if (res.ok) {
        const json = await res.json();
        // Bot returns flat shape: { status: "success", referralCode, shareUrl, stats, referrals, ... }
        if (json.status === "success" && json.referralCode) {
          setData({
            referralCode: json.referralCode,
            shareUrl: json.shareUrl,
            totalEarnedCores: json.totalEarnedCores ?? 0,
            hasClaimedCode: json.hasClaimedCode ?? false,
            stats: json.stats ?? { totalInvites: 0, qualifiedInvites: 0, pendingInvites: 0 },
            referrals: json.referrals ?? [],
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch referral info:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for stored referral cookie and auto-claim on mount
  useEffect(() => {
    if (!session?.user?.id) return;

    const autoClaimCookie = async () => {
      const match = document.cookie.match(/(?:^|; )rr_ref_code=([^;]*)/);
      if (match && match[1]) {
        const code = decodeURIComponent(match[1]);
        try {
          const claimRes = await fetch("/api/user/referral/claim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });
          const claimJson = await claimRes.json();
          if (claimRes.ok && claimJson.success) {
            toast.success(
              claimJson.message || "Referral code applied automatically!"
            );
          }
        } catch {
          // Ignore error silently
        } finally {
          // Clear cookie
          document.cookie =
            "rr_ref_code=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        }
      }
      // Delay to avoid overwhelming bot with concurrent requests
      const timer = setTimeout(() => fetchReferralInfo(), 1500);
      return () => clearTimeout(timer);
    };

    autoClaimCookie();
  }, [session?.user?.id, fetchReferralInfo]);

  const handleCopyLink = () => {
    if (!data?.shareUrl) return;
    navigator.clipboard.writeText(data.shareUrl);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimInputCode.trim()) return;

    try {
      setIsClaiming(true);
      const res = await fetch("/api/user/referral/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: claimInputCode.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.status === "success") {
        toast.success(json.message || "Referral code applied!");
        setClaimInputCode("");
        fetchReferralInfo();
      } else {
        toast.error(json.error || json.message || "Failed to apply referral code");
      }
    } catch {
      toast.error("Network error claiming code. Please try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Card className="bg-zinc-950/50 border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 via-purple-500/5 to-amber-500/5 pointer-events-none" />
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-linear-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30 shrink-0 mt-0.5">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-white font-bold text-lg leading-snug">
              Referral Program &amp; Passive Rewards
            </CardTitle>
            <div className="mt-1">
              <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono text-xs">
                Ongoing 15% Bonus
              </Badge>
            </div>
            <CardDescription className="text-zinc-400 mt-1">
              Share your unique link. Earn 15% bonus Cores on every purchase your invitees make!
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Top Banners 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Share Link Banner */}
          <div className="p-4 bg-zinc-900/60 rounded-xl border border-cyan-500/20 relative overflow-hidden flex flex-col justify-between">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Your Unique Referral Link
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-9 text-xs sm:text-sm font-mono text-zinc-300 select-all truncate grow bg-zinc-950/60 px-3 rounded-lg border border-white/10 flex items-center">
                {isLoading ? (
                  <span className="animate-pulse text-zinc-500">Generating link...</span>
                ) : (
                  data?.shareUrl || "https://rolereactor.xyz?ref="
                )}
              </div>
              <Button
                size="sm"
                onClick={handleCopyLink}
                disabled={isLoading || !data?.shareUrl}
                className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_16px_rgba(6,182,212,0.35)] h-9 text-xs px-3 shrink-0"
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5 mr-1 text-emerald-300" /> Copied</>
                ) : (
                  <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>
                )}
              </Button>
            </div>
          </div>

          {/* Redeem Friend's Code Banner / Status */}
          {data?.hasClaimedCode ? (
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-400">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="font-semibold">Referral Bonus Active:</strong> You get <span className="underline">+10% bonus Cores</span> on your first purchase of $10 or more!
              </span>
            </div>
          ) : (
            <form onSubmit={handleManualClaim} className="p-4 bg-zinc-900/60 rounded-xl border border-purple-500/20 flex flex-col justify-between">
              <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Gift className="w-3.5 h-3.5" /> Referred by a Friend?
              </div>
              <div className="flex items-center gap-2 grow">
                <input
                  type="text"
                  placeholder="E.G. RR-ABCDEF"
                  value={claimInputCode}
                  onChange={(e) => setClaimInputCode(e.target.value.toUpperCase())}
                  maxLength={9}
                  className="h-9 bg-zinc-950 border border-white/15 rounded-lg px-3 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 uppercase grow"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isClaiming || !claimInputCode.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white shrink-0 text-xs px-4 h-9 font-medium shadow-[0_0_16px_rgba(168,85,247,0.35)]"
                >
                  {isClaiming ? "Applying..." : "Apply Referral"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-zinc-900/40 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1.5 text-center min-h-28">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono leading-none">
              {data?.stats.totalInvites ?? 0}
            </div>
            <div className="text-xs text-zinc-400 leading-tight">Total Invites</div>
          </div>

          <div className="p-3 bg-zinc-900/40 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1.5 text-center min-h-28">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono leading-none">
              {data?.stats.qualifiedInvites ?? 0}
            </div>
            <div className="text-xs text-zinc-400 leading-tight">Qualified Buyers</div>
          </div>

          <div className="p-3 bg-zinc-900/40 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1.5 text-center min-h-28">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div
              className={cn(
                "text-xl font-bold text-purple-300 leading-none",
                audiowide.className
              )}
            >
              +{(data?.totalEarnedCores ?? 0).toFixed(2)}
            </div>
            <div className="text-xs text-zinc-400 leading-tight">Cores Earned</div>
          </div>
        </div>

        {/* Benefits Explainer Banner */}
        <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/15 text-xs text-zinc-300 space-y-2">
          <div className="font-semibold text-purple-400 flex items-center gap-1.5 text-sm">
            <Gift className="w-4 h-4" /> How Referral Rewards Work:
          </div>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1">
            <li>
              <strong className="text-zinc-200">Instant Referee Gift:</strong> Your friend receives <span className="text-amber-400 font-semibold">+25 Sparks welcome bonus</span> instantly upon applying your code, plus <span className="text-emerald-400 font-semibold">+10% bonus Cores</span> on their first purchase of $10+.
            </li>
            <li>
              <strong className="text-zinc-200">Ongoing Passive Reward:</strong> You earn <span className="text-cyan-400 font-semibold">15% bonus Cores</span> on <em className="not-italic text-white underline">every single purchase</em> your referred friends make in the future!
            </li>
          </ul>
        </div>

        {/* Referral History Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Referral Activity
          </h4>

          {isLoading ? (
            <div className="text-center py-6 text-xs text-zinc-500 animate-pulse">
              Loading referral history...
            </div>
          ) : data?.referrals && data.referrals.length > 0 ? (
            <div className="space-y-2">
              {data.referrals.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 p-3 bg-zinc-900/30 rounded-lg border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-mono font-bold text-zinc-400 text-xs shrink-0">
                      #{i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-zinc-200 truncate">
                        User {item.refereeIdMasked}
                      </div>
                      <div className="text-zinc-500 text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-purple-400 font-mono whitespace-nowrap">
                        +{item.referrerBonusEarned.toFixed(2)} Cores
                      </div>
                      <div className="text-[11px] text-zinc-500 whitespace-nowrap">
                        ${item.totalPurchased.toFixed(2)} paid
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-[10px] uppercase font-mono px-1.5 py-0.5 whitespace-nowrap",
                        item.status === "qualified"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      )}
                    >
                      {item.status === "qualified" ? "Qualified" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-zinc-900/20 rounded-xl border border-dashed border-white/10 text-xs text-zinc-500">
              No referrals yet. Share your unique link above to start earning ongoing Cores!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
