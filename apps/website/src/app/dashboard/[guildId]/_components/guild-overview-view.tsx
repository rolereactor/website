"use client";

import { GuildHero } from "./guild-hero";
import { useServerStore } from "@/store/use-server-store";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Crown,
  Rocket,
  Cable,
  TrendingUp,
  MessageSquare,
  Ticket,
  Zap,
  Gift,
} from "lucide-react";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "motion/react";

import { cn, getDiscordImageUrl } from "@/lib/utils";
import { audiowide, orbitron } from "@/lib/fonts";
import { CyberpunkBackground } from "@/components/common/cyberpunk-background";
import { CryptoCheckout } from "@/components/crypto/crypto-checkout";
import dynamic from "next/dynamic";

function getPastDays(days: number) {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      joins: 0,
      leaves: 0,
    });
  }
  return dates;
}

import { GuildStats, GuildSettings } from "@/types/discord";

interface GuildOverviewProps {
  guildId: string;
  settings: GuildSettings;
  guildStats: GuildStats;
  isPremium: boolean;
}

import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const GuildGrowthChart = dynamic(
  () => import("./guild-growth-chart").then((m) => m.GuildGrowthChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-75 w-full bg-cyan-500/5 animate-pulse rounded-xl border border-cyan-500/10" />
    ),
  }
);

export function GuildOverviewView({
  guildId,
  settings: initialSettings,
  guildStats: initialGuildStats,
  isPremium: initialIsPremium,
}: GuildOverviewProps) {
  const { data } = useSWR(`/api/guilds/${guildId}/settings`, fetcher, {
    fallbackData: {
      settings: initialSettings,
      guildStats: initialGuildStats,
      isPremium: initialIsPremium,
    },
    refreshInterval: 60000,
    revalidateOnFocus: false,
  });

  const settings = data?.settings || initialSettings;
  const guildStats = data?.guildStats || initialGuildStats;
  const isPremium = data?.isPremium ?? initialIsPremium;

  const { guilds } = useServerStore();
  const activeGuild = guilds.find((g) => g.id === guildId);

  const guildName = activeGuild?.name || settings?.name || "Node Hub";
  const guildIcon = activeGuild?.icon || settings?.icon;

  const growthData =
    guildStats?.growthHistory?.length > 0
      ? guildStats.growthHistory.slice(-14)
      : getPastDays(14);

  const onlineCount =
    guildStats?.onlineCount ??
    guildStats?.presence_count ??
    guildStats?.approximate_presence_count ??
    0;
  const memberCount = guildStats?.memberCount || 1;
  const onlinePercentage = (onlineCount / memberCount) * 100;
  let onlineStatusText = "Systems Idle";
  let onlineBadgeVariant: "success" | "accent" | "outline" = "outline";

  if (onlineCount > 0) {
    if (onlinePercentage > 40) {
      onlineStatusText = "High Traffic";
      onlineBadgeVariant = "success";
    } else if (onlinePercentage > 20) {
      onlineStatusText = "Moderate Activity";
      onlineBadgeVariant = "success";
    } else if (onlinePercentage > 5) {
      onlineStatusText = "Low Activity";
      onlineBadgeVariant = "accent";
    }
  } else {
    onlineStatusText = "Server Inactive";
    onlineBadgeVariant = "outline";
  }

  const new7d = guildStats?.growth?.new7d ?? 0;
  const memberTrendLabel =
    new7d > 0 ? `+${new7d} this week` : new7d < 0 ? `${new7d} this week` : "Stable";
  const memberBadgeVariant =
    new7d > 0 ? "success" : new7d < 0 ? "destructive" : "outline";

  const boostTier = guildStats?.premiumTier || 0;
  const boostBadgeVariant = boostTier > 0 ? "info" : "outline";

  const stats = [
    {
      label: "Total Members",
      value:
        (
          guildStats?.humanCount ??
          (guildStats?.memberCount || 0) - (guildStats?.botCount || 0)
        ).toLocaleString() || "0",
      icon: Users,
      trend: memberTrendLabel,
      badgeVariant: memberBadgeVariant,
      color: "cyan",
    },
    {
      label: "Server Boosts",
      value: guildStats?.premiumSubscriptionCount?.toString() || "0",
      icon: Rocket,
      trend: `Level ${boostTier}`,
      badgeVariant: boostBadgeVariant,
      color: "fuchsia",
    },
    {
      label: "Online Now",
      value: onlineCount.toLocaleString(),
      icon: Cable,
      trend: onlineStatusText,
      badgeVariant: onlineBadgeVariant,
      color: "emerald",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Banner (if visible) */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            variant="cyberpunk"
            className="border-purple-500/20 hover:border-purple-500/50 hover:shadow-purple-500/20 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-purple-600/10 to-blue-600/10 opacity-50" />

            <div className="relative z-10 p-6 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "text-lg font-bold text-white flex items-center gap-2",
                        audiowide.className
                      )}
                    >
                      Pro Engine
                      <Badge
                        variant="pro"
                        className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                      >
                        PRO
                      </Badge>
                    </h3>
                    <p className="text-zinc-500 text-xs font-medium">
                      Unlock advanced automation and premium features
                    </p>
                  </div>
                </div>
                <Button
                  variant="neon"
                  size="lg"
                  className="z-10 bg-purple-500 hover:bg-purple-400 text-white shadow-purple-500/20 shrink-0"
                  asChild
                >
                  <Link href={`/dashboard/${guildId}/pro-engine`}>
                    Upgrade Now
                  </Link>
                </Button>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="relative z-10 px-6 pb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <DashboardBenefit
                  icon={MessageSquare}
                  title="20 Role Reactions"
                  sub="Engage members"
                  color="text-cyan-400"
                  bgColor="bg-cyan-500/10"
                />
                <DashboardBenefit
                  icon={Ticket}
                  title="Advanced Ticketing"
                  sub="500/mo, automation"
                  color="text-amber-400"
                  bgColor="bg-amber-500/10"
                />
                <DashboardBenefit
                  icon={Zap}
                  title="500 Schedules"
                  sub="Automated roles"
                  color="text-purple-400"
                  bgColor="bg-purple-500/10"
                />
                <DashboardBenefit
                  icon={Gift}
                  title="50K Entries"
                  sub="Massive giveaways"
                  color="text-pink-400"
                  bgColor="bg-pink-500/10"
                />
              </div>
            </div>

            {/* Background Decorative */}
            <div className="absolute top-0 right-0 w-64 h-full bg-linear-to-l from-purple-500/10 to-transparent pointer-events-none" />
          </Card>
        </motion.div>
      )}

      {/* Hero Header */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GuildHero
          guildName={guildName}
          guildIcon={guildIcon}
          guildId={guildId}
        />

        {/* Recent Arrivals Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="h-full"
        >
          <Card
            variant="glass"
            className="h-full flex flex-col relative overflow-hidden"
          >
            <CyberpunkBackground
              gridSize={24}
              gridOpacity={0.02}
              gridColor="#10b981"
              showGlows={true}
              glowOpacity={0.3}
            />
            <div className="relative z-10 flex flex-col h-full p-6">
              <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users className="w-3 h-3 text-cyan-400" /> Recent Arrivals
              </h3>

              <div className="space-y-2 pb-2 flex-1 overflow-y-auto pr-1 custom-scrollbar max-h-75 xl:max-h-none">
                {guildStats?.recentMembers?.length > 0 ? (
                  guildStats.recentMembers.map(
                    (member: {
                      userId: string;
                      username: string;
                      avatar: string;
                      joinedAt: string;
                    }) => (
                      <Link
                        key={member.userId}
                        href={`https://discord.com/users/${member.userId}`}
                        target="_blank"
                        className="block"
                      >
                        <Card
                          variant="glass"
                          className="p-2.5 transition-all group cursor-pointer flex-1"
                          contentClassName="flex-row items-center gap-3"
                        >
                          <Avatar variant="cyber" size="sm">
                            <AvatarImage
                              src={
                                getDiscordImageUrl(
                                  "avatars",
                                  member.userId,
                                  member.avatar,
                                  64
                                ) || undefined
                              }
                              alt={member.username}
                              width={32}
                              height={32}
                            />
                            <AvatarFallback>
                              {member.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col z-10 relative">
                            <span className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                              {member.username}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Joined{" "}
                              {new Date(member.joinedAt).toLocaleDateString(
                                [],
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}{" "}
                              •{" "}
                              {new Date(member.joinedAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </Card>
                      </Link>
                    )
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 opacity-40">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center mb-4">
                      <Users className="w-5 h-5 text-zinc-600" />
                    </div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      No Recent Joins
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-5 space-y-3 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                    Member Split
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 text-[10px] font-black">
                      {guildStats?.humanCount || 0}H
                    </span>
                    <span className="text-zinc-700 text-[10px] font-black">
                      /
                    </span>
                    <span className="text-fuchsia-400 text-[10px] font-black">
                      {guildStats?.botCount || 0}B
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                    Growth Trend
                  </span>
                  <Badge variant="accent" className="py-1">
                    +{guildStats?.growth?.new24h || 0} TODAY
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className={cn(i === 2 ? "sm:col-span-2 xl:col-span-1" : "")}
          >
            <Card
              variant="stat"
              className="group transition-all duration-300 h-full"
            >
              <div
                className={cn(
                  "absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity",
                  stat.color === "cyan"
                    ? "text-cyan-500"
                    : stat.color === "fuchsia"
                      ? "text-fuchsia-500"
                      : stat.color === "emerald"
                        ? "text-emerald-500"
                        : "text-zinc-500"
                )}
              >
                <stat.icon className="w-24 h-24 -mt-6 -mr-6 rotate-12" />
              </div>

              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      "p-2.5 rounded-md bg-linear-to-br border border-white/5 shadow-inner",
                      stat.color === "cyan"
                        ? "from-cyan-500/20 to-blue-500/20 text-cyan-400"
                        : stat.color === "fuchsia"
                          ? "from-fuchsia-500/20 to-pink-500/20 text-fuchsia-400"
                          : stat.color === "emerald"
                            ? "from-emerald-500/20 to-teal-500/20 text-emerald-400"
                            : "from-zinc-500/20 to-slate-500/20 text-zinc-400"
                    )}
                  >
                    <stat.icon className="w-5 h-5" />
                  </div>
                  {stat.trend && (
                    <Badge
                      variant={stat.badgeVariant as "success" | "destructive" | "info" | "accent" | "outline"}
                      className="tabular-nums border-none"
                    >
                      {stat.trend}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <h3
                    className={cn(
                      "text-3xl font-black text-white tabular-nums tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]",
                      orbitron.className
                    )}
                  >
                    {stat.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area — Growth Insights Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-emerald-500 w-5 h-5" /> Server Growth
            Insights
          </h2>
        </div>
        <Card variant="glass">
          <CyberpunkBackground
            gridSize={24}
            gridOpacity={0.02}
            gridColor="#00ffff"
            showGlows={true}
            glowOpacity={0.4}
          />
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Member Growth Trend
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  Last 14 Days • Joins vs Leaves
                </p>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 bg-zinc-950/40 px-3.5 py-1.5 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                  <span className="text-[11px] text-zinc-300 font-black uppercase tracking-wider">
                    Joins
                  </span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.4)]" />
                  <span className="text-[11px] text-zinc-300 font-black uppercase tracking-wider">
                    Leaves
                  </span>
                </div>
              </div>
            </div>

            <div className="h-75 w-full">
              <GuildGrowthChart data={growthData} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Web3 Checkout Demo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="text-blue-500 w-5 h-5" /> Crypto Checkout Demo
          </h2>
        </div>
        <Card variant="glass">
          <CyberpunkBackground
            gridSize={24}
            gridOpacity={0.02}
            gridColor="#3b82f6"
            showGlows={true}
            glowOpacity={0.4}
          />
          <CardContent className="p-8 relative z-10 flex justify-center">
             <CryptoCheckout 
               usdAmount={10.00} 
               packageId="$10"
               receiverAddress={process.env.NEXT_PUBLIC_WEB3_RECEIVER_ADDRESS || "0xC850f03295Bb614d52038FB83f78f72ed8f7c65d"} 
             />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function DashboardBenefit({
  icon: Icon,
  title,
  sub,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  title: string;
  sub: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-colors hover:scale-[1.02]",
        bgColor,
        color.includes("cyan") && "border-cyan-500/20 hover:border-cyan-500/40",
        color.includes("amber") &&
          "border-amber-500/20 hover:border-amber-500/40",
        color.includes("purple") &&
          "border-purple-500/20 hover:border-purple-500/40",
        color.includes("pink") && "border-pink-500/20 hover:border-pink-500/40"
      )}
    >
      <div className={cn("p-1.5 rounded-md", bgColor, color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-white truncate">
          {title}
        </span>
        <span className="text-[9px] text-zinc-500 truncate">{sub}</span>
      </div>
    </div>
  );
}
