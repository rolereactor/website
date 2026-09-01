"use client";

import { useState, use, useEffect } from "react";
import { Audiowide } from "next/font/google";
import {
  BarChart3,
  Crown,
  Lock,
  Zap,
  Download,
  Loader2,
  ChevronDown,
  FileSpreadsheet,
  FileJson,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useServerStore } from "@/store/use-server-store";
import { useProEngineStore } from "@/store/use-pro-engine-store";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/app/dashboard/_components/page-header";
import { ErrorView } from "@/components/common/error-view";
import { NodeLoader } from "@/components/common/node-loader";
import { PremiumGuard } from "@/app/dashboard/_components/premium-guard";
import { toast } from "@/lib/toast";

import dynamic from "next/dynamic";
import { AnalyticsStats } from "./_components/analytics-stats";
import { TopMembers } from "./_components/top-members";
import { ActivityBreakdown } from "./_components/activity-breakdown";
import useSWR from "swr";

const GrowthChart = dynamic(
  () => import("./_components/growth-chart").then((mod) => mod.GrowthChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const DailyTrends = dynamic(
  () => import("./_components/daily-trends").then((mod) => mod.DailyTrends),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return (
    <div className="h-87.5 w-full bg-zinc-900/10 animate-pulse rounded-xl border border-white/5" />
  );
}

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const FREE_MAX_DAYS = 7;

interface AnalyticsPageProps {
  params: Promise<{ guildId: string }>;
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { guildId } = use(params);
  const [days, setDays] = useState(FREE_MAX_DAYS);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { data: session } = useSession();

  const { guilds } = useServerStore();
  const activeGuild = guilds.find((g) => g.id === guildId);
  const guildName = activeGuild?.name || "this server";

  // Premium status
  const { settingsCache, fetchSettings } = useProEngineStore();
  const proData = settingsCache[guildId] ?? null;
  const isPremium = proData?.isPremium?.pro || false;

  useEffect(() => {
    if (guildId) {
      fetchSettings(guildId);
    }
  }, [guildId, fetchSettings]);

  // Force free users to 7D
  const effectiveDays = isPremium ? days : FREE_MAX_DAYS;

  const { data, error, isLoading } = useSWR(
    `/api/guilds/${guildId}/analytics?days=${effectiveDays}`,
    fetcher,
    {
      refreshInterval: isPremium ? 120000 : 0, // Auto-refresh only for Pro
      revalidateOnFocus: false,
    }
  );

  const history = data?.history || [];
  const activityStats = data?.activityStats || {
    totalMessages: 0,
    totalVoiceMinutes: 0,
    totalCommands: 0,
  };
  const topMembers = data?.topMembers || { chatters: [], voiceUsers: [] };

  const handleActivatePremium = async () => {
    if (!session?.user?.id || isActivating) return;

    setIsActivating(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/premium/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureId: "pro_engine",
          userId: session.user.id,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Activation failed");

      toast.success("✨ Pro Engine unlocked!");
      await fetchSettings(guildId, true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Activation error";
      console.error("Failed to activate premium:", err);
      toast.error(message);
    } finally {
      setIsActivating(false);
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }

    if (!history || history.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    setIsExporting(true);

    try {
      const safeGuildName = guildName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const dateStr = new Date().toISOString().split("T")[0];
      const fileName = `${safeGuildName}_analytics_${effectiveDays}d_${dateStr}.${format}`;

      interface AnalyticsDay {
        date?: string;
        label?: string;
        members?: number;
        joins?: number;
        leaves?: number;
        messages?: number;
        voiceMinutes?: number;
        commands?: number;
        roleReactions?: number;
      }

      const getResolvedDate = (day: AnalyticsDay) => {
        if (day.date) return day.date;
        if (day.label) {
          const year = new Date().getFullYear();
          return `${year}-${day.label.replace(" ", "-")}`;
        }
        return "unknown";
      };

      let content = "";
      let type = "";

      if (format === "csv") {
        const headers = [
          "Date",
          "Total Members",
          "Joins",
          "Leaves",
          "Net Growth",
          "Messages",
          "Voice Minutes",
          "Commands",
          "Role Reactions",
        ];

        const rows = history.map((day: AnalyticsDay) => [
          getResolvedDate(day),
          day.members ?? 0,
          day.joins ?? 0,
          day.leaves ?? 0,
          (day.joins ?? 0) - (day.leaves ?? 0),
          day.messages ?? 0,
          day.voiceMinutes ?? 0,
          day.commands ?? 0,
          day.roleReactions ?? 0,
        ]);

        content = [
          headers.join(","),
          ...rows.map((row: (string | number)[]) => row.join(",")),
        ].join("\n");
        type = "text/csv;charset=utf-8;";
      } else if (format === "json") {
        const payload = {
          guildId,
          guildName,
          exportDate: new Date().toISOString(),
          periodDays: effectiveDays,
          aggregatedStats: activityStats,
          history: history.map((day: AnalyticsDay) => ({
            date: getResolvedDate(day),
            label: day.label,
            metrics: {
              totalMembers: day.members ?? 0,
              joins: day.joins ?? 0,
              leaves: day.leaves ?? 0,
              netGrowth: (day.joins ?? 0) - (day.leaves ?? 0),
              messages: day.messages ?? 0,
              voiceMinutes: day.voiceMinutes ?? 0,
              commands: day.commands ?? 0,
              roleReactions: day.roleReactions ?? 0,
            },
          })),
        };
        content = JSON.stringify(payload, null, 2);
        type = "application/json;charset=utf-8;";
      }

      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast.success(`${format.toUpperCase()} export compiled and downloaded!`);
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-background">
        <NodeLoader
          title="Loading Dashboard"
          subtitle="Synchronizing your data..."
        />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6 w-full">
        <PageHeader
          category="Core Management"
          categoryIcon={BarChart3}
          title="Analytics"
          description="Track server growth and activity for"
          serverName={guildName}
        />
        <ErrorView
          title="Data Unavailable"
          message="Failed to load analytics data. The bot may be offline."
          showHome={false}
        />
      </div>
    );
  }

  const timeRanges = [
    { label: "7D", value: 7, free: true },
    { label: "14D", value: 14, free: false },
    { label: "30D", value: 30, free: false },
    { label: "90D", value: 90, free: false },
  ];

  return (
    <>
      <PremiumGuard
        open={showPremiumModal}
        onOpenChange={setShowPremiumModal}
        onActivate={handleActivatePremium}
        isActivating={isActivating}
        title="UNLOCK ANALYTICS"
        description="Get deeper insights with extended time ranges, detailed activity stats, and auto-refreshing data."
        features={[
          "30 & 90 Day History",
          "Activity Breakdown",
          "Auto-Refresh Data",
          "Top Members Panel",
        ]}
      />

      <div className="space-y-6 w-full">
        <PageHeader
          category="Core Management"
          categoryIcon={BarChart3}
          title="Analytics"
          description="Track server growth and activity for"
          serverName={guildName}
        />

        <div className="flex flex-wrap items-center gap-1 bg-zinc-900/50 border border-white/5 rounded-xl p-1 w-fit">
          {timeRanges.map((range) => {
            const locked = !range.free && !isPremium;
            return (
              <Button
                key={range.value}
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (locked) {
                    setShowPremiumModal(true);
                  } else {
                    setDays(range.value);
                  }
                }}
                className={cn(
                  "h-8 px-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all relative",
                  audiowide.className,
                  effectiveDays === range.value
                    ? "bg-cyan-500/15 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] border border-cyan-500/20"
                    : locked
                      ? "text-zinc-500 hover:text-amber-400/80 hover:bg-amber-500/10 border border-transparent cursor-pointer"
                      : "text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 cursor-pointer"
                )}
              >
                {locked && <Lock className="w-2.5 h-2.5 mr-1 text-amber-500" />}
                {range.label}
              </Button>
            );
          })}

          <div className="w-px h-6 bg-white/10 mx-1" />

          {isPremium ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isExporting}
                  className={cn(
                    "h-8 px-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all",
                    audiowide.className,
                    "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 shadow-[0_0_10px_-2px_rgba(6,182,212,0.2)] hover:shadow-[0_0_15px_-2px_rgba(6,182,212,0.4)]"
                  )}
                >
                  {isExporting ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {isExporting ? "Compiling..." : "Export Data"}
                  <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="cursor-pointer font-medium p-3"
                  onClick={() => handleExport("csv")}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-cyan-400" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm">CSV File</span>
                    <span className="text-[10px] text-zinc-500 font-normal">
                      For Excel & Sheets
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer font-medium p-3"
                  onClick={() => handleExport("json")}
                >
                  <FileJson className="w-4 h-4 mr-2 text-purple-400" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm">JSON Payload</span>
                    <span className="text-[10px] text-zinc-500 font-normal">
                      For API & Developers
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowPremiumModal(true)}
              className={cn(
                "h-8 px-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all",
                audiowide.className,
                "bg-zinc-800/30 text-zinc-500 hover:text-amber-400/80 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20"
              )}
            >
              <Lock className="w-2.5 h-2.5 mr-1.5 text-amber-500" />
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export
            </Button>
          )}
        </div>

        {/* Stats Overview — Net Growth free, rest gated */}
        <AnalyticsStats
          activityStats={activityStats}
          history={history}
          isPremium={isPremium}
          onUpgrade={() => setShowPremiumModal(true)}
        />

        {/* Growth Chart — always visible */}
        <GrowthChart history={history} days={effectiveDays} />

        {/* Top Members — Pro only */}
        <TopMembers
          chatters={topMembers.chatters}
          voiceUsers={topMembers.voiceUsers}
          isPremium={isPremium}
          onUpgrade={() => setShowPremiumModal(true)}
        />

        {/* Daily Trends — Pro only */}
        <DailyTrends
          history={history}
          isPremium={isPremium}
          onUpgrade={() => setShowPremiumModal(true)}
        />

        {/* Activity Breakdown — Pro only */}
        <ActivityBreakdown
          activityStats={activityStats}
          isPremium={isPremium}
          onUpgrade={() => setShowPremiumModal(true)}
        />

        {/* Pro Upsell Banner — only for free users */}
        {!isPremium && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-zinc-900/50 p-6">
              <div className="absolute inset-0 bg-linear-to-r from-amber-500/5 via-transparent to-cyan-500/5" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-500/20 to-cyan-500/20 flex items-center justify-center border border-amber-500/20">
                    <Crown className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "text-sm font-bold text-white uppercase tracking-wider",
                        audiowide.className
                      )}
                    >
                      Unlock Full Analytics
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Extended time ranges, detailed activity stats, top
                      members, and auto-refreshing data.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPremiumModal(true)}
                  className="bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-300 font-black uppercase tracking-widest text-[10px] shrink-0"
                >
                  <Zap className="w-3.5 h-3.5 mr-2 fill-current" />
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
