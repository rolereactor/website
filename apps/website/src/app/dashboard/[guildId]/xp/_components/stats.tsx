"use client";

import { Audiowide } from "next/font/google";
import { Crown, Users, Zap, Trophy } from "lucide-react";

import { cn, getDiscordImageUrl } from "@/lib/utils";
import { type LeaderboardEntry } from "@/store/use-xp-store";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface StatsGridProps {
  leaderboard: LeaderboardEntry[];
  averageLevel: number;
}

export function StatsGrid({ leaderboard, averageLevel }: StatsGridProps) {
  const topMember = leaderboard[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Champion Card */}
      <Card
        variant="cyberpunk"
        className="border-amber-500/20 hover:border-amber-500/40"
      >
        <div className="absolute inset-0 bg-linear-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Crown className="w-24 h-24 rotate-12 text-amber-500" />
        </div>
        <div className="p-5 flex items-center gap-4 relative">
          <div className="relative shrink-0">
            <div className="absolute -inset-2 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
            <Avatar className="h-12 w-12 border-2 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] relative z-10 rounded-xl">
              <AvatarImage
                src={
                  getDiscordImageUrl(
                    "avatars",
                    topMember.userId,
                    topMember.user.avatar,
                    64
                  ) || undefined
                }
                alt={topMember.user.username}
                width={48}
                height={48}
              />
              <AvatarFallback className="bg-amber-950 text-amber-500 font-black text-xs">
                {(topMember?.user.username || "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-lg border border-amber-400 shadow-[0_0_10px_#f59e0b] z-20">
              RANK I
            </div>
          </div>
          <div className="min-w-0">
            <div
              className={cn(
                "text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-0.5",
                audiowide.className
              )}
            >
              GRAND CHAMPION
            </div>
            <div
              className={cn(
                "font-black text-white truncate text-sm uppercase tracking-wide",
                audiowide.className
              )}
              title={topMember?.user.username}
            >
              {topMember?.user.username || "TBA"}
            </div>
            <div className="text-[10px] text-zinc-500 font-bold font-mono truncate uppercase">
              Lvl {topMember?.level || 0} •{" "}
              {topMember?.totalXP.toLocaleString()} XP
            </div>
          </div>
        </div>
      </Card>

      {/* Active Users */}
      <Card
        variant="stat"
        className="border-cyan-500/20 hover:border-cyan-500/40 p-5 flex flex-col justify-center min-h-25"
      >
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Users className="w-20 h-20 rotate-12 text-cyan-500" />
        </div>
        <div className="flex items-center gap-2 text-zinc-500 mb-2 relative z-10 min-w-0">
          <Users className="w-4 h-4 text-cyan-500 shrink-0" />
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-wider truncate",
              audiowide.className
            )}
            title="Total Members"
          >
            Total Members
          </span>
        </div>
        <div
          className={cn(
            "text-3xl font-black text-white relative z-10 tabular-nums",
            audiowide.className
          )}
        >
          {leaderboard.length.toLocaleString()}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-cyan-500/20 to-transparent" />
      </Card>

      {/* Average Level */}
      <Card
        variant="stat"
        className="border-purple-500/20 hover:border-purple-500/40 p-5 flex flex-col justify-center min-h-25"
      >
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Zap className="w-20 h-20 rotate-12 text-purple-500" />
        </div>
        <div className="flex items-center gap-2 text-zinc-500 mb-2 relative z-10 min-w-0">
          <Zap className="w-4 h-4 text-purple-500 shrink-0" />
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-wider truncate",
              audiowide.className
            )}
            title="Average Level"
          >
            Average Level
          </span>
        </div>
        <div
          className={cn(
            "text-3xl font-black text-white relative z-10 tabular-nums",
            audiowide.className
          )}
        >
          {averageLevel}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />
      </Card>

      {/* Total XP */}
      <Card
        variant="stat"
        className="border-emerald-500/20 hover:border-emerald-500/40 p-5 flex flex-col justify-center min-h-25"
      >
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Trophy className="w-20 h-20 rotate-12 text-emerald-500" />
        </div>
        <div className="flex items-center gap-2 text-zinc-500 mb-2 relative z-10 min-w-0">
          <Trophy className="w-4 h-4 text-emerald-500 shrink-0" />
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-wider truncate",
              audiowide.className
            )}
            title="System Energy"
          >
            System Energy
          </span>
        </div>
        <div
          className={cn(
            "text-3xl font-black text-white relative z-10 tabular-nums",
            audiowide.className
          )}
        >
          {(
            leaderboard.reduce(
              (acc: number, curr: LeaderboardEntry) => acc + curr.totalXP,
              0
            ) / 1000
          ).toFixed(1)}
          <span className="text-emerald-500">K</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-emerald-500/20 to-transparent" />
      </Card>
    </div>
  );
}
