"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Zap,
  Plus,
  Gift,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PricingDialog } from "@/components/pricing/pricing-dialog";
import Image from "next/image";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { audiowide } from "@/lib/fonts";
import { useCoreBalance } from "@/hooks/use-core-balance";
import { ReferralSection } from "@/components/account/referral-section";

interface Transaction {
  paymentId: string;
  provider: string;
  type?: string;
  amount: number;
  coresGranted: number;
  sparksGranted: number;
  status: string;
  createdAt: string;
  currency?: string;
  metadata?: {
    direction?: "sent" | "received";
    targetUsername?: string;
    senderUsername?: string;
    taxAmount?: number;
    netAmount?: number;
  };
}

export function BillingSection() {
  const { data: session } = useSession();
  const { cores, sparks, isLoading, mutate } = useCoreBalance();
  const [redeemCode, setRedeemCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [visibleTransactions, setVisibleTransactions] = useState(5);

  useEffect(() => {
    if (session?.user?.id && !isLoading) {
      // Delay to avoid overwhelming bot with concurrent requests
      const timer = setTimeout(() => fetchTransactions(), 1000);
      return () => clearTimeout(timer);
    }
  }, [session?.user?.id, isLoading]);

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const response = await fetch("/api/user/transactions");
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const showMoreTransactions = () => {
    setVisibleTransactions((prev) => prev + 20);
  };

  const activeTransactions = transactions.filter(
    (tx) => tx.coresGranted !== 0 || tx.sparksGranted !== 0 || tx.amount > 0
  );

  const hasMoreTransactions = visibleTransactions < activeTransactions.length;

  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      toast.error("Please enter a redeem code");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Please sign in to redeem codes");
      return;
    }

    setIsRedeeming(true);
    try {
      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: redeemCode.trim(),
          userId: session.user.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Successfully redeemed! ${data.message || ""}`);
        setRedeemCode("");
        await mutate(); // Refresh balance from API
        fetchTransactions(); // Refresh transactions
      } else {
        toast.error(data.error || "Invalid or expired code");
      }
    } catch {
      toast.error("Failed to redeem code. Please try again.");
    } finally {
      setIsRedeeming(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed" || status === "success") {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
    if (status === "pending" || status === "processing") {
      return <Clock className="w-4 h-4 text-yellow-400" />;
    }
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  const getProviderBadge = (provider: string) => {
    if (provider === "top.gg") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30">
          Vote Reward
        </Badge>
      );
    }
    if (provider === "premium_system") {
      return (
        <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30">
          Pro Engine
        </Badge>
      );
    }
    if (provider === "vault") {
      return (
        <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30">
          Vault
        </Badge>
      );
    }
    if (provider === "admin_adjustment") {
      return (
        <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30">
          Admin
        </Badge>
      );
    }
    if (provider === "buymeacoffee") {
      return (
        <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30">
          BMAC
        </Badge>
      );
    }
    if (provider === "transfer") {
      return (
        <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30">
          Transfer
        </Badge>
      );
    }
    if (provider === "referral_bonus") {
      return (
        <Badge className="bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30">
          Referral
        </Badge>
      );
    }
    return (
      <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30">
        Crypto
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Core Balance & Redeem Code Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Balance Card (Spans 2 columns on desktop) */}
        <Card className="lg:col-span-2 bg-zinc-950/50 border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white font-bold text-lg flex items-center gap-2">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  Cores &amp; Sparks Balance
                </CardTitle>
                <CardDescription className="text-zinc-400 mt-1">
                  Manage Cores for Pro Engine and reward Sparks across servers
                </CardDescription>
              </div>
              <PricingDialog>
                <Button
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Cores
                </Button>
              </PricingDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Cores Card */}
              <div className="p-4 bg-zinc-900/60 rounded-xl border border-cyan-500/20 flex items-center gap-3.5 relative overflow-hidden">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 relative z-10 overflow-hidden rounded-full">
                    <Image
                      src="/images/core_energy.png"
                      alt="Cores"
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
Cores
                    </span>
                    <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] px-1.5 py-0 font-mono shrink-0">
                      Transferable
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "text-2xl sm:text-3xl font-black text-white tracking-wide leading-none",
                        audiowide.className
                      )}
                    >
                      {(cores ?? 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono leading-none">
                      (≈ ${((cores ?? 0) * 0.2).toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Sparks Card */}
              <div className="p-4 bg-zinc-900/60 rounded-xl border border-amber-500/20 flex items-center gap-3.5 relative overflow-hidden">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 relative z-10 overflow-hidden rounded-full">
                    <Image
                      src="/images/spark_energy.png"
                      alt="Sparks"
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      Sparks
                    </span>
                    <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-1.5 py-0 font-mono shrink-0">
                      Rewards
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "text-2xl sm:text-3xl font-black text-amber-300 tracking-wide leading-none",
                        audiowide.className
                      )}
                    >
                      {Math.floor(sparks ?? 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono leading-none">
                      Free Rewards
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/10">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <div className="text-xs text-zinc-400 space-y-0.5">
                  <p>
                    <strong className="text-cyan-300">Cores</strong> are transferable energy credits for Pro Engine &amp; custom branding. <strong className="text-amber-300">Sparks</strong> are earned via Top.gg voting &amp; referral gifts for personal rewards.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redeem Code Card (1 column on desktop) */}
        <Card className="lg:col-span-1 bg-zinc-950/50 border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5 pointer-events-none" />
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Gift className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-white font-bold text-lg">
                  Redeem Code
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  Instant promo & gift activation
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="p-3.5 bg-purple-500/5 rounded-lg border border-purple-500/10 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-300 leading-relaxed">
                Enter a valid promo or gift code to instantly add Cores to your global energy balance.
              </p>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="ENTER CODE..."
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                className="bg-zinc-900/50 border-white/10 text-white font-mono uppercase tracking-wider h-11 text-center focus:border-purple-500/50"
                disabled={isRedeeming}
              />
              <Button
                onClick={handleRedeemCode}
                disabled={isRedeeming || !redeemCode.trim()}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] h-11 font-semibold transition-all"
              >
                {isRedeeming ? "Redeeming..." : "Redeem Promo Code"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Card */}
      <Card className="bg-zinc-950/50 border-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-zinc-700/50 rounded-lg">
              <Clock className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <CardTitle className="text-white font-bold text-lg">
                Transaction History
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Your past core purchases and redemptions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-zinc-500 text-sm">
                Loading transactions...
              </div>
            </div>
          ) : activeTransactions.length > 0 ? (
            <div className="space-y-1.5">
              <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
                {activeTransactions.slice(0, visibleTransactions).map((tx, index) => (
                  <div
                    key={tx.paymentId || index}
                    className="flex items-center justify-between py-2 px-3 bg-zinc-900/40 rounded-lg border border-white/5 hover:border-white/10 transition-all text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 shrink-0">
                        {getStatusIcon(tx.status)}
                        {getProviderBadge(tx.provider)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          {tx.coresGranted !== 0 && (
                            <span
                              className={cn(
                                "font-bold text-xs",
                                tx.coresGranted < 0
                                  ? "text-rose-400"
                                  : tx.coresGranted > 0
                                  ? "text-emerald-400"
                                  : "text-zinc-400"
                              )}
                            >
                              {tx.coresGranted > 0 ? "+" : ""}
                              {tx.coresGranted.toLocaleString()} Cores
                              {tx.provider === "transfer" && tx.metadata?.direction === "sent" && tx.metadata?.targetUsername && (
                                <span className="text-zinc-500 font-normal"> → @{tx.metadata.targetUsername}</span>
                              )}
                              {tx.provider === "transfer" && tx.metadata?.direction === "received" && tx.metadata?.senderUsername && (
                                <span className="text-zinc-500 font-normal"> from @{tx.metadata.senderUsername}</span>
                              )}
                            </span>
                          )}
                          {tx.sparksGranted !== 0 && (
                            <span
                              className={cn(
                                "font-bold text-xs",
                                tx.sparksGranted < 0
                                  ? "text-rose-400"
                                  : tx.sparksGranted > 0
                                  ? "text-amber-400"
                                  : "text-zinc-400"
                              )}
                            >
                              {tx.sparksGranted > 0 ? "+" : ""}
                              {tx.sparksGranted.toLocaleString()} Sparks
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {formatDate(tx.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {tx.amount > 0 ? (
                        <>
                          <div className="text-white font-mono text-xs font-semibold">
                            ${tx.amount.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-zinc-500 uppercase">
                            {tx.currency || "USD"}
                          </div>
                        </>
                      ) : (
                        <div className="text-[11px] text-zinc-500">Free</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {hasMoreTransactions && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showMoreTransactions}
                    className="h-8 text-xs border-white/10 text-zinc-400 hover:text-white hover:border-cyan-500/30 hover:bg-cyan-500/5"
                  >
                    Show More ({activeTransactions.length - visibleTransactions}{" "}
                    remaining)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-zinc-900 rounded-full inline-block mb-4">
                <Clock className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                No Transactions Yet
              </h3>
              <p className="text-zinc-500 text-sm mb-4">
                Your purchase history will appear here
              </p>
              <PricingDialog>
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Get Your First Cores
                </Button>
              </PricingDialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Program Section */}
      <ReferralSection />
    </div>
  );
}
