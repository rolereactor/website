"use client";

import { audiowide } from "@/lib/fonts";
import { Search } from "lucide-react";

import { cn, getDiscordImageUrl } from "@/lib/utils";
import { type LeaderboardEntry } from "@/store/use-xp-store";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ConditionalAdBlock } from "@/components/propellerads";

interface LeaderboardListProps {
  leaderboard: LeaderboardEntry[];
  filteredLeaderboard: LeaderboardEntry[];
  searchQuery: string;
  isPremium?: boolean;
}

export function LeaderboardList({
  leaderboard,
  filteredLeaderboard,
  searchQuery,
  isPremium = false,
}: LeaderboardListProps) {
  const displayData = searchQuery ? filteredLeaderboard : leaderboard;

  return (
    <Card variant="cyberpunk" className="w-full">
      <div className="p-0 overflow-x-auto">
        <div className="min-w-100">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 text-[10px] uppercase font-black text-zinc-500 tracking-widest border-b border-white/5 bg-white/2 min-w-0">
            <div
              className={cn(
                "col-span-1 text-center font-black",
                audiowide.className
              )}
            >
              #
            </div>
            <div
              className={cn(
                "col-span-5 sm:col-span-5 md:col-span-5",
                audiowide.className
              )}
            >
              Community Members
            </div>
            <div
              className={cn(
                "hidden md:block md:col-span-4 text-right",
                audiowide.className
              )}
            >
              Level Progress
            </div>
            <div
              className={cn(
                "col-span-6 sm:col-span-6 md:col-span-2 text-right",
                audiowide.className
              )}
            >
              Total XP
            </div>
          </div>

          <div className="max-h-200 overflow-y-auto overflow-x-hidden custom-scrollbar min-w-0">
            {displayData.map((entry, i) => {
              const actualRank = searchQuery
                ? leaderboard.findIndex((e) => e.userId === entry.userId) + 1
                : i + 1;

              const isTop3 = actualRank <= 3;
              const progress = (entry.totalXP % 1000) / 10;

              return (
                <div key={entry.userId}>
                  <div
                    className={cn(
                      "grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/3 transition-all border-b border-white/5 last:border-0 group relative min-w-0",
                      isTop3 && "bg-white/1"
                    )}
                  >
                    <div className="col-span-1 flex justify-center">
                      <Badge
                        variant={
                          actualRank === 1
                            ? "premium"
                            : actualRank === 2 || actualRank === 3
                              ? "outline"
                              : "secondary"
                        }
                        className={cn(
                          "w-7 h-7 flex items-center justify-center rounded-lg p-0 font-black text-[10px] tabular-nums transition-all duration-300 group-hover:scale-110",
                          actualRank === 2 &&
                            "text-zinc-300 border-white/20 bg-white/10",
                          actualRank === 3 &&
                            "text-orange-400 border-orange-500/40 bg-orange-500/20",
                          actualRank > 3 &&
                            "text-zinc-500 border-white/10 bg-zinc-900",
                          audiowide.className
                        )}
                      >
                        {actualRank}
                      </Badge>
                    </div>

                    <div className="col-span-5 sm:col-span-5 md:col-span-5 flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="relative shrink-0">
                        {isTop3 && (
                          <div
                            className={cn(
                              "absolute inset-0 blur-md rounded-lg opacity-20",
                              actualRank === 1
                                ? "bg-amber-500"
                                : actualRank === 2
                                  ? "bg-zinc-300"
                                  : "bg-orange-500"
                            )}
                          />
                        )}
                        <Avatar
                          className={cn(
                            "h-10 w-10 sm:h-11 sm:w-11 shrink-0 transition-all duration-300 group-hover:border-white/20 rounded-xl relative z-10",
                            isTop3
                              ? "border-2 border-white/20"
                              : "border border-white/10"
                          )}
                        >
                          <AvatarImage
                            src={
                              getDiscordImageUrl(
                                "avatars",
                                entry.userId,
                                entry.user.avatar,
                                64
                              ) || undefined
                            }
                            alt={entry.user.username}
                            width={44}
                            height={44}
                          />
                          <AvatarFallback className="bg-zinc-900 font-black text-[10px] text-zinc-500">
                            {entry.user.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="truncate min-w-0 flex flex-col">
                        <div
                          className={cn(
                            "font-black transition-colors truncate text-sm uppercase tracking-wide",
                            isTop3
                              ? "text-white group-hover:text-cyan-400"
                              : "text-zinc-400 group-hover:text-white",
                            audiowide.className
                          )}
                        >
                          {entry.user.username}
                        </div>
                        <div className="text-[9px] text-zinc-600 font-black flex items-center gap-2 uppercase tracking-tighter">
                          LEVEL {entry.level}
                          {entry.rankInfo && (
                            <Badge
                              variant="outline"
                              className="text-[8px] h-4 px-1.5 gap-1 border-white/5"
                              style={
                                entry.rankInfo.color
                                  ? {
                                      backgroundColor: `#${entry.rankInfo.color.toString(16).padStart(6, "0")}15`,
                                      color: `#${entry.rankInfo.color.toString(16).padStart(6, "0")}`,
                                      borderColor: `#${entry.rankInfo.color.toString(16).padStart(6, "0")}30`,
                                    }
                                  : {}
                              }
                            >
                              <span className="text-[10px]">
                                {entry.rankInfo.emoji}
                              </span>
                              {entry.rankInfo.title}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex md:col-span-4 flex-col justify-center gap-2.5">
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 relative">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000 relative z-10",
                            isTop3
                              ? "bg-linear-to-r from-cyan-500 via-blue-500 to-purple-500"
                              : "bg-cyan-600 opacity-40 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                          )}
                          style={{ width: `${progress}%` }}
                        />
                        <div className="absolute inset-0 bg-white/5 animate-pulse" />
                      </div>
                      <div className="flex justify-between items-center text-[8px] uppercase tracking-widest font-black text-zinc-600">
                        <span>Progress</span>
                        <span className="text-zinc-500">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "col-span-6 sm:col-span-6 md:col-span-2 text-right font-black text-xs tabular-nums transition-colors tracking-widest",
                        isTop3
                          ? "text-cyan-400"
                          : "text-zinc-500 group-hover:text-white",
                        audiowide.className
                      )}
                    >
                      {entry.totalXP.toLocaleString()}
                    </div>

                    {/* Hover accent */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-0 bg-cyan-500 group-hover:h-1/2 transition-all duration-300 rounded-r-full shadow-[0_0_15px_#06b6d4]" />
                  </div>
                  {actualRank % 50 === 0 &&
                    actualRank !== displayData.length && (
                      <div className="border-b border-white/5 py-8 px-6 bg-white/1">
                        <ConditionalAdBlock
                          zoneId={
                            process.env.NEXT_PUBLIC_PROPELLERADS_FEED_ZONE || ""
                          }
                          className="max-h-30"
                          hide={isPremium}
                        />
                      </div>
                    )}
                </div>
              );
            })}

            {searchQuery && filteredLeaderboard.length === 0 && (
              <div className="py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <p className="text-sm text-zinc-400 font-medium">No members found</p>
                <p className="text-zinc-500 text-xs font-bold mt-1">
                  We couldn't find any results for &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
