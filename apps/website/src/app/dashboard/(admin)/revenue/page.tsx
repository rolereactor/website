import type { Metadata } from "next";
import { auth } from "@/auth";
import { botFetchJson } from "@/lib/bot-fetch";
import { PageHeader } from "@/app/dashboard/_components/page-header";

export const metadata: Metadata = {
  title: "Revenue & Billing | Admin Console",
  description: "Monitor revenue streams and transaction logs",
};
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  Users,
  History,
  TrendingUp,
  ArrowUpRight,
  Bitcoin,
  Coffee,
  CreditCard,
  Wallet,
  Coins,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatCompactNumber } from "@/lib/utils";
import { RevenueAreaChart } from "./_components/revenue-chart";
import { Suspense, lazy } from "react";
import { NodeLoader } from "@/components/common/node-loader";

const LazyRevenueChart = lazy(() =>
  import("./_components/revenue-chart").then((mod) => ({
    default: mod.RevenueAreaChart,
  }))
);

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface ProviderStat {
  provider: string;
  revenue: number;
  paymentsCount: number;
  coresGranted: number;
}

interface PaymentStats {
  overview: {
    totalPayments: number;
    totalRevenue: number;
    totalCoresGranted: number;
    uniqueCustomers: number;
  };
  byProvider?: ProviderStat[];
  recentPayments: Array<{
    paymentId: string;
    discordId: string;
    provider: string;
    amount: number;
    coresGranted: number;
    createdAt: string;
  }>;
}

const providerMeta: Record<
  string,
  {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badgeStyle: string;
  }
> = {
  plisio: {
    name: "Plisio (Crypto)",
    icon: Coins,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    badgeStyle: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  },
  buymeacoffee: {
    name: "Buy Me a Coffee",
    icon: Coffee,
    color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    badgeStyle: "border-yellow-500/30 text-yellow-400 bg-yellow-500/10",
  },
  stripe: {
    name: "Stripe",
    icon: CreditCard,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    badgeStyle: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
  },
  paypal: {
    name: "PayPal",
    icon: Wallet,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    badgeStyle: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  },
};

async function getPaymentStats() {
  const session = await auth();
  const userId = session?.user?.id;

  try {
    return await botFetchJson<PaymentStats>("/payments/stats", { userId });
  } catch (error) {
    console.error("Failed to fetch payment stats:", error);
    return null;
  }
}

function RevenueLoader() {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background">
      <NodeLoader
        title="Loading Dashboard"
        subtitle="Synchronizing your data..."
      />
    </div>
  );
}

async function RevenueContent() {
  const stats = await getPaymentStats();

  if (!stats) {
    return (
      <Card variant="cyberpunk" className="border-red-500/50 bg-red-500/5">
        <CardContent className="pt-6">
          <p className="font-mono text-sm text-red-500 font-bold uppercase">
            Payment Data Unavailable // Connection Error
          </p>
        </CardContent>
      </Card>
    );
  }

  const { overview, recentPayments, byProvider = [] } = stats;

  return (
    <>
      {/* Revenue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RevenueStatCard
          title="Total Earnings"
          value={formatCurrency(overview.totalRevenue)}
          icon={DollarSign}
          description="Cumulative system revenue"
          color="emerald"
        />
        <RevenueStatCard
          title="Cores Issued"
          value={formatCompactNumber(overview.totalCoresGranted)}
          icon={TrendingUp}
          description="Total credits minted"
          color="cyan"
        />
        <RevenueStatCard
          title="Unique Payers"
          value={formatCompactNumber(overview.uniqueCustomers)}
          icon={Users}
          description="Distinct customers"
          color="fuchsia"
        />
        <RevenueStatCard
          title="Transfers"
          value={formatCompactNumber(overview.totalPayments)}
          icon={History}
          description="Total validated transactions"
          color="amber"
        />
      </div>

      {/* Gateway Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["plisio", "buymeacoffee", "stripe", "paypal"].map((providerKey) => {
          const meta = providerMeta[providerKey];
          const ProviderIcon = meta.icon;
          const stat = byProvider.find((p) => p.provider === providerKey);
          const revenue = stat?.revenue ?? 0;
          const count = stat?.paymentsCount ?? 0;

          return (
            <Card
              key={providerKey}
              variant="cyberpunk"
              className="p-4 bg-zinc-950/30 border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2 rounded-lg border", meta.color)}>
                  <ProviderIcon className="size-4" />
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-[9px] uppercase font-mono font-bold", meta.badgeStyle)}
                >
                  {count} {count === 1 ? "Tx" : "Txs"}
                </Badge>
              </div>
              <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-black">
                {meta.name}
              </p>
              <p className="text-xl font-black text-white font-mono tracking-tighter mt-0.5">
                {formatCurrency(revenue)}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Projection Card */}
        <Card
          showGrid
          className="lg:col-span-2 overflow-hidden border-cyan-500/20"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Revenue Distribution</CardTitle>
              <CardDescription>Revenue over time across gateways</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="text-[10px] border-cyan-500/20 text-cyan-400"
              >
                GATEWAYS
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-87.5 pt-4">
            <Suspense
              fallback={
                <div className="h-full w-full bg-zinc-900/10 animate-pulse rounded-xl" />
              }
            >
              <LazyRevenueChart data={recentPayments} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Recent Financial Bursts */}
        <Card
          variant="cyberpunk"
          className="flex flex-col h-full bg-zinc-950/40 border-white/5"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <History className="size-4 text-zinc-500" />
            </div>
            <CardDescription>Latest system transactions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            {recentPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 opacity-30 italic font-mono text-sm uppercase tracking-widest">
                No transactions tracked
              </div>
            ) : (
              recentPayments.map((payment) => {
                const meta = providerMeta[payment.provider] || {
                  name: payment.provider || "Gateway",
                  icon: DollarSign,
                  color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                  badgeStyle: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
                };
                const ProviderIcon = meta.icon;

                return (
                  <div
                    key={payment.paymentId}
                    className="group relative p-3 bg-zinc-900/40 border border-white/5 rounded-xl hover:bg-zinc-900/60 hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg text-xs font-black border",
                            meta.color
                          )}
                        >
                          <ProviderIcon className="size-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-[11px] font-bold text-zinc-100 group-hover:text-cyan-400 transition-colors uppercase">
                              {payment.paymentId.slice(0, 8)}...
                            </p>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] px-1.5 py-0 uppercase font-mono font-bold",
                                meta.badgeStyle
                              )}
                            >
                              {meta.name}
                            </Badge>
                          </div>
                          <p className="text-[9px] text-zinc-500 font-medium mt-0.5">
                            User ID: {payment.discordId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white font-mono leading-none tracking-tighter">
                          +{formatCurrency(payment.amount)}
                        </p>
                        <p className="text-[8px] text-zinc-600 font-mono italic uppercase mt-0.5">
                          {formatCompactNumber(payment.coresGranted)} Cores
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-[8px] text-zinc-600 font-mono tracking-widest uppercase">
                      {formatTimeAgo(new Date(payment.createdAt))} ago
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default async function AdminRevenuePage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        category="Developer Access"
        categoryIcon={DollarSign}
        title="Revenue & Billing"
        description="Monitor revenue streams and transaction logs for the entire system."
      />

      <Suspense fallback={<RevenueLoader />}>
        <RevenueContent />
      </Suspense>
    </div>
  );
}

function RevenueStatCard({
  title,
  value,
  icon: Icon,
  description,
  color = "emerald",
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color?: "cyan" | "fuchsia" | "emerald" | "amber";
}) {
  const colorMap = {
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    fuchsia: "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20",
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  };

  return (
    <Card
      variant="cyberpunk"
      className="group relative isolate h-full border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden"
    >
      <CardContent className="pt-6 relative">
        {/* Glow effect */}
        <div
          className={cn(
            "absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[50px] opacity-20 transition-opacity group-hover:opacity-40",
            color === "cyan"
              ? "bg-cyan-500"
              : color === "fuchsia"
                ? "bg-fuchsia-500"
                : color === "emerald"
                  ? "bg-emerald-500"
                  : "bg-amber-500"
          )}
        />

        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "p-2 rounded mt-1 border transition-all group-hover:scale-110",
              colorMap[color]
            )}
          >
            <Icon className="size-4" />
          </div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase font-black">
            {title}
          </span>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-black tracking-tighter text-white font-mono italic shadow-white/5">
            {value}
          </h2>
        </div>

        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic border-t border-white/5 mt-4 pt-3 flex items-center justify-between">
          {description}
          <ArrowUpRight className="size-3 text-zinc-700 group-hover:text-zinc-300 transition-colors" />
        </p>
      </CardContent>
    </Card>
  );
}
