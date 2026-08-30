import { cn, getDiscordImageUrl } from "@/lib/utils";
import { audiowide } from "@/lib/fonts";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LeaderboardEntry } from "@/store/use-xp-store";

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  currentUserId?: string;
  period?: string;
}

/** XP needed to go from level N to level N+1 (same formula used in the dashboard) */
function getXpForLevel(level: number): number {
  return (level + 1) * 1000;
}

/** XP earned within the current level (i.e. totalXP mod level bucket) */
function getLevelProgress(
  totalXP: number,
  level: number
): {
  currentXP: number;
  neededXP: number;
  progressPct: number;
} {
  // XP thresholds: level N starts at N*(N+1)/2 * 1000 roughly, but
  // the dashboard uses a simple (totalXP % 1000) formula, so we do the same.
  const neededXP = getXpForLevel(level);
  const currentXP = totalXP % neededXP;
  const progressPct = Math.min(100, (currentXP / neededXP) * 100);
  return { currentXP, neededXP, progressPct };
}

export function LeaderboardTable({
  leaderboard,
  currentUserId,
  period = "all",
}: LeaderboardTableProps) {
  const currentUserRank = currentUserId
    ? leaderboard.findIndex((e) => e.userId === currentUserId) + 1
    : 0;

  return (
    <Card variant="cyberpunk" className="w-full">
      {/* Time Filters */}
      <div className="flex flex-wrap items-center gap-2 p-4 border-b border-white/5 bg-zinc-950/50">
        {[
          { id: "all", label: "All Time" },
          { id: "monthly", label: "Monthly" },
          { id: "weekly", label: "Weekly" },
          { id: "daily", label: "Daily" },
        ].map((tab) => (
          <Link
            key={tab.id}
            href={`?period=${tab.id}`}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              period === tab.id
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent",
              audiowide.className
            )}
            scroll={false}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="p-0 overflow-x-auto">
        <div className="min-w-100">
          <TableHeader period={period} />
          <div className="flex flex-col max-h-200 overflow-y-auto custom-scrollbar">
            {leaderboard.length === 0 ? (
              <EmptyState period={period} />
            ) : (
              leaderboard.map((entry, i) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  rank={i + 1}
                  isCurrentUser={currentUserId === entry.userId}
                  period={period}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Current user callout if they're ranked */}
      {currentUserId && currentUserRank > 0 && (
        <CurrentUserBanner
          rank={currentUserRank}
          entry={leaderboard[currentUserRank - 1]}
        />
      )}
    </Card>
  );
}

function TableHeader({ period = "all" }: { period?: string }) {
  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 text-[10px] uppercase font-black text-zinc-500 tracking-widest border-b border-white/5 bg-white/2">
      <div
        className={cn("col-span-1 text-center font-black", audiowide.className)}
      >
        #
      </div>
      <div className={cn("col-span-5", audiowide.className)}>
        Community Member
      </div>
      <div className={cn("col-span-4 hidden md:block", audiowide.className)}>
        Progress
      </div>
      <div
        className={cn(
          "col-span-3 md:col-span-2 text-right",
          audiowide.className
        )}
      >
        {period === "all" ? "Total XP" : `${period} XP`}
      </div>
    </div>
  );
}

function EmptyState({ period = "all" }: { period?: string }) {
  const messages: Record<string, { heading: string; sub: string }> = {
    daily: {
      heading: "No activity today yet",
      sub: "Start chatting to appear on today's leaderboard!",
    },
    weekly: {
      heading: "No activity this week yet",
      sub: "Earn XP this week to climb the weekly leaderboard.",
    },
    monthly: {
      heading: "No activity this month yet",
      sub: "Earn XP this month to appear on the monthly leaderboard.",
    },
    all: {
      heading: "No members on the leaderboard yet",
      sub: "Start chatting to earn XP and appear here!",
    },
  };

  const { heading, sub } = messages[period] ?? messages["all"];

  return (
    <div className="py-24 text-center px-6">
      <p className="text-zinc-500 uppercase tracking-widest font-black text-sm mb-2">
        {heading}
      </p>
      <p className="text-zinc-700 text-xs font-medium">{sub}</p>
    </div>
  );
}

function LeaderboardRow({
  entry,
  rank,
  isCurrentUser,
  period,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
  period: string;
}) {
  const isTop3 = rank <= 3;
  const { currentXP, neededXP, progressPct } = getLevelProgress(
    entry.totalXP,
    entry.level
  );

  const displayXP = (() => {
    switch (period) {
      case "daily":
        return entry.dailyXP || 0;
      case "weekly":
        return entry.weeklyXP || 0;
      case "monthly":
        return entry.monthlyXP || 0;
      default:
        return entry.totalXP;
    }
  })();

  const xpToNext = neededXP - currentXP;

  return (
    <div
      className={cn(
        "grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/3 transition-all border-b border-white/5 last:border-0 relative group",
        isTop3 && "bg-white/1",
        isCurrentUser &&
          "bg-cyan-500/5 border-l-2 border-l-cyan-500/60 hover:bg-cyan-500/10"
      )}
    >
      {/* Rank Badge */}
      <div className="col-span-1 flex justify-center relative z-10">
        <Badge
          variant={rank === 1 ? "premium" : rank <= 3 ? "outline" : "secondary"}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-lg p-0 font-black text-[10px] tabular-nums",
            rank === 2 && "text-zinc-300 border-white/20 bg-white/10",
            rank === 3 &&
              "text-orange-400 border-orange-500/40 bg-orange-500/20",
            rank > 3 && "text-zinc-500 border-white/10 bg-zinc-900",
            isCurrentUser &&
              rank > 3 &&
              "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
            audiowide.className
          )}
        >
          {rank}
        </Badge>
      </div>

      {/* User Info */}
      <div className="col-span-5 flex items-center gap-3 relative z-10">
        <div className="relative shrink-0">
          {isTop3 && (
            <div
              className={cn(
                "absolute inset-0 blur-md rounded-lg opacity-20",
                rank === 1
                  ? "bg-amber-500"
                  : rank === 2
                    ? "bg-zinc-300"
                    : "bg-orange-500"
              )}
            />
          )}
          {isCurrentUser && !isTop3 && (
            <div className="absolute inset-0 blur-md rounded-lg opacity-30 bg-cyan-500" />
          )}
          <Avatar
            className={cn(
              "h-10 w-10 shrink-0 transition-all duration-300 group-hover:border-white/20 relative z-10",
              isTop3 ? "border-2 border-white/20" : "border border-white/10",
              isCurrentUser && "border-cyan-500/40"
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
            />
            <AvatarFallback className="text-[10px] uppercase font-black bg-zinc-900">
              {entry.user.username.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="truncate flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                "font-black text-sm uppercase truncate transition-colors",
                isTop3
                  ? "text-cyan-400"
                  : "text-zinc-400 group-hover:text-white",
                isCurrentUser && !isTop3 && "text-cyan-300",
                audiowide.className
              )}
            >
              {entry.user.username}
            </span>
            {isCurrentUser && (
              <span className="shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest">
                YOU
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {/* Level — visible on all screens */}
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-widest shrink-0",
                isTop3 ? "text-zinc-400" : "text-zinc-600"
              )}
            >
              LV{entry.level}
            </span>
            {entry.rankInfo && (
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest truncate">
                {entry.rankInfo.emoji} {entry.rankInfo.title}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* XP Progress Bar — desktop */}
      <div className="hidden md:flex md:col-span-4 flex-col justify-center gap-1.5 relative z-10">
        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 relative">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 relative z-10",
              isCurrentUser
                ? "bg-linear-to-r from-cyan-400 via-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                : isTop3
                  ? "bg-linear-to-r from-cyan-500 via-blue-500 to-purple-500"
                  : "bg-cyan-700/50"
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[8px] uppercase tracking-widest font-black text-zinc-600">
          <span className="text-zinc-500">
            {currentXP.toLocaleString()}{" "}
            <span className="text-zinc-700">/ {neededXP.toLocaleString()}</span>
          </span>
          <span className={cn(isCurrentUser ? "text-cyan-500/70" : "")}>
            +{xpToNext.toLocaleString()} to LV{entry.level + 1}
          </span>
        </div>
      </div>

      {/* XP Display */}
      <div
        className={cn(
          "col-span-3 md:col-span-2 text-right font-black tabular-nums tracking-widest relative z-10 transition-colors text-xs",
          isTop3 || isCurrentUser
            ? "text-cyan-400"
            : "text-zinc-500 group-hover:text-white",
          audiowide.className
        )}
      >
        {displayXP.toLocaleString()}
      </div>

      {/* Hover accent */}
      <div
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 rounded-r-full shadow-[0_0_15px_#06b6d4] transition-all duration-300",
          isCurrentUser
            ? "bg-cyan-400 h-2/3"
            : "bg-cyan-500 h-0 group-hover:h-1/2"
        )}
      />
    </div>
  );
}

function CurrentUserBanner({
  rank,
  entry,
}: {
  rank: number;
  entry: LeaderboardEntry;
}) {
  const {
    xpToNext: _xpToNext,
    currentXP,
    neededXP,
  } = (() => {
    const nx = getXpForLevel(entry.level);
    const cx = entry.totalXP % nx;
    return { xpToNext: nx - cx, currentXP: cx, neededXP: nx };
  })();
  const progressPct = Math.min(100, (currentXP / neededXP) * 100);

  return (
    <div className="border-t border-cyan-500/20 bg-cyan-500/5 px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-widest font-black text-cyan-400/70">
          Your rank
        </span>
        <span
          className={cn(
            "text-cyan-400 font-black text-sm",
            audiowide.className
          )}
        >
          #{rank}
        </span>
        <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5 max-w-40">
          <div
            className="h-full rounded-full bg-linear-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
          +{(neededXP - currentXP).toLocaleString()} XP to LV{entry.level + 1}
        </span>
      </div>
    </div>
  );
}
