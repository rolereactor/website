import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { Trophy, Users, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BubbleBackground } from "@/components/common/bubble-background";
import { Badge } from "@/components/ui/badge";
import { botFetchJson } from "@/lib/bot-fetch";
import { checkBotStatus } from "@/lib/bot-status";
import { audiowide } from "@/lib/fonts";
import { cn } from "@/lib/utils";

import { ServerSearch } from "@/app/(home)/_components/server-search";
import { ConditionalAdBlock } from "@/components/propellerads";
import { WifiOff } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Top Communities | Role Reactor",
    description:
      "Discover the most active Discord communities powered by Role Reactor's XP system. View leaderboards, track progress, and compete with other servers.",
    openGraph: {
      title: "Top Communities | Role Reactor",
      description:
        "Discover the most active Discord communities powered by Role Reactor's XP system.",
      type: "website",
      locale: "en_US",
      url: "/leaderboards",
      siteName: "Role Reactor",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Role Reactor Leaderboards",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Top Communities | Role Reactor",
      description:
        "Discover the most active Discord communities powered by Role Reactor's XP system.",
      images: ["/og.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

interface GuildResult {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  totalXP?: number;
  rankedCount?: number;
  rank?: number;
}

const formatCompactNumber = (number: number) => {
  if (number < 1000) return number.toString();
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
};

const getRankStyles = (rank: number) => {
  const brandAvatar = {
    avatar: "ring-white/10 group-hover:ring-emerald-500/50",
  };

  switch (rank) {
    case 1:
      return {
        badge:
          "text-amber-300 bg-amber-500/20 border-amber-500/40 shadow-[0_0_20px_rgba(251,191,36,0.2)]",
        avatar:
          "ring-amber-500/40 group-hover:ring-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.2)]",
        glow: "bg-amber-500/20",
        text: "group-hover:text-amber-300",
      };
    case 2:
      return {
        badge:
          "text-zinc-200 bg-zinc-400/20 border-zinc-400/40 shadow-[0_0_20px_rgba(161,161,170,0.2)]",
        avatar:
          "ring-zinc-400/40 group-hover:ring-zinc-200 shadow-[0_0_15px_rgba(161,161,170,0.2)]",
        glow: "bg-zinc-400/20",
        text: "group-hover:text-zinc-100",
      };
    case 3:
      return {
        badge:
          "text-orange-300 bg-orange-500/20 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.2)]",
        avatar:
          "ring-orange-500/40 group-hover:ring-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.2)]",
        glow: "bg-orange-500/20",
        text: "group-hover:text-orange-300",
      };
    default:
      return {
        badge:
          "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
        glow: "bg-emerald-500/10",
        text: "group-hover:text-emerald-400",
        ...brandAvatar,
      };
  }
};

export default async function LeaderboardsPage() {
  const botStatus = await checkBotStatus();
  let guilds: GuildResult[] = [];

  if (!botStatus.online) {
    return (
      <main className="min-h-screen relative flex flex-col items-center py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-zinc-950 pointer-events-none" />
          <BubbleBackground
            interactive={false}
            className="absolute inset-0 opacity-20"
            transition={{ stiffness: 50, damping: 30 }}
            colors={{
              first: "139, 92, 246",
              second: "236, 72, 153",
              third: "168, 85, 247",
              fourth: "99, 102, 241",
              fifth: "59, 130, 246",
              sixth: "124, 58, 237",
            }}
          />
          <div className="absolute inset-0 bg-black/60 pointer-events-none" />
        </div>

        <div className="relative z-10 w-full max-w-fd-container mx-auto mt-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <WifiOff className="w-10 h-10 text-red-500" />
          </div>
          <h1
            className={cn(
              "text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4",
              audiowide.className
            )}
          >
            Service Unavailable
          </h1>
          <p className="text-zinc-400 max-w-md text-base leading-relaxed mb-2">
            The bot service is currently offline. Leaderboards and XP data are
            temporarily unavailable.
          </p>
          <p className="text-zinc-600 text-sm">
            Please try again in a few minutes.
          </p>
        </div>
      </main>
    );
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await botFetchJson<any>(
      "/guilds/public-leaderboards?limit=30",
      {
        next: { revalidate: 0 },
      }
    );
    if (data?.guilds) {
      guilds = data.guilds;
    }
  } catch (error) {
    console.error("Failed to fetch top leaderboards", error);
  }

  return (
    <main className="min-h-screen relative flex flex-col items-center py-24 px-4 overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none" />
        <BubbleBackground
          interactive={false}
          className="absolute inset-0 opacity-20"
          transition={{ stiffness: 50, damping: 30 }}
          colors={{
            first: "139, 92, 246",
            second: "236, 72, 153",
            third: "168, 85, 247",
            fourth: "99, 102, 241",
            fifth: "59, 130, 246",
            sixth: "124, 58, 237",
          }}
        />
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-fd-container mx-auto mt-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-6 max-w-2xl mx-auto relative z-10">
          <Badge
            variant="secondary"
            className="bg-zinc-800/80 text-zinc-300 border-zinc-700/50 gap-2 mb-4 px-5 py-2 hover:bg-zinc-800 backdrop-blur-md"
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium tracking-wide">
              TOP COMMUNITIES
            </span>
          </Badge>

          <h1
            className={cn(
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]",
              audiowide.className
            )}
          >
            XP{" "}
            <span className="bg-linear-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Leaderboards
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-4">
            Discover the most active Discord communities powered by Role
            Reactor&apos;s XP system.
          </p>

          <div className="pt-8">
            <ServerSearch />
          </div>

          <ConditionalAdBlock
            zoneId={
              process.env.NEXT_PUBLIC_PROPELLERADS_LEADERBOARDS_TOP_ZONE || ""
            }
            className="mt-8"
          />
        </div>

        {/* Guild Grid */}
        <div className="space-y-3 pt-4 relative z-10 w-full">
          <div className="flex items-center justify-between">
            <p
              className={cn(
                "text-[10px] uppercase tracking-widest font-black text-zinc-600",
                audiowide.className
              )}
            >
              Ranked by total XP
            </p>
            <p className="text-[10px] uppercase tracking-widest font-black text-zinc-700">
              {guilds.length} server{guilds.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guilds.length > 0 ? (
              guilds.map((guild) => {
                const rank = guild.rank || 0;
                const styles = getRankStyles(rank);
                const isTop3 = rank > 0 && rank <= 3;

                return (
                  <Link
                    href={`/leaderboards/${guild.id}`}
                    key={guild.id}
                    className="block group"
                    prefetch={false}
                  >
                    <div
                      className={cn(
                        "flex items-center p-4 rounded-2xl border bg-zinc-950/40 backdrop-blur-md hover:bg-zinc-900/80 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300 gap-4 overflow-hidden relative h-full",
                        isTop3
                          ? "border-amber-500/30 hover:border-amber-500/40"
                          : "border-white/5 hover:border-emerald-500/30"
                      )}
                    >
                      {/* Subtle Spotlight */}
                      <div
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 left-6 w-20 h-20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700",
                          styles.glow
                        )}
                      />
                      <div className="absolute inset-0 bg-linear-to-r from-transparent to-zinc-950/80 pointer-events-none rounded-2xl" />

                      {/* Avatar */}
                      <Avatar
                        className={cn(
                          "h-14 w-14 rounded-xl ring-1 transition-all duration-300 shadow-md relative z-10 shrink-0 bg-zinc-900",
                          styles.avatar
                        )}
                      >
                        <AvatarImage
                          src={guild.icon || undefined}
                          alt={guild.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-zinc-900 text-zinc-400 text-sm font-bold rounded-xl uppercase">
                          {guild.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex flex-col relative z-10 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className={cn(
                              "text-white text-base font-bold truncate transition-colors leading-snug",
                              styles.text,
                              audiowide.className
                            )}
                            title={guild.name}
                          >
                            {guild.name}
                          </h3>
                          <span
                            className={cn(
                              "text-xs font-black px-2 py-0.5 rounded-xl border uppercase tracking-wider shrink-0 ml-auto",
                              styles.badge,
                              audiowide.className
                            )}
                          >
                            #{rank}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 font-bold tracking-tighter uppercase whitespace-nowrap">
                            <Users className="w-3 h-3 text-emerald-500/60" />
                            {guild.memberCount.toLocaleString()}
                          </span>
                          {guild.rankedCount !== undefined && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 font-bold tracking-tighter uppercase whitespace-nowrap">
                              <Trophy className="w-3 h-3 text-emerald-500/60" />
                              {guild.rankedCount} ranked
                            </span>
                          )}
                          {guild.totalXP !== undefined && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 font-bold tracking-tighter uppercase whitespace-nowrap bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                              {formatCompactNumber(guild.totalXP)} XP
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full py-24 text-center text-zinc-500 font-medium bg-zinc-950/40 backdrop-blur-sm rounded-4xl border border-white/5 flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 bg-zinc-900/80 rounded-full flex items-center justify-center border border-white/5">
                  <ShieldCheck className="w-10 h-10 text-emerald-500/30" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl text-zinc-300">
                    No public leaderboards found yet
                  </p>
                  <p className="text-sm text-zinc-500 font-normal">
                    Enable the XP system in your server to appear here!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <ConditionalAdBlock
          zoneId={
            process.env.NEXT_PUBLIC_PROPELLERADS_LEADERBOARDS_BOTTOM_ZONE || ""
          }
          className="mt-8"
        />
      </div>
    </main>
  );
}
