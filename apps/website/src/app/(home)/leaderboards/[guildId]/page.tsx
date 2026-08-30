import { Metadata } from "next";

import { Trophy, Lock, Users, Crown, TrendingUp } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";
import { checkBotStatus } from "@/lib/bot-status";
import { LeaderboardEntry, GuildStats } from "@/types/discord";
import { audiowide } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { BubbleBackground } from "@/components/common/bubble-background";
import { ConditionalAdBlock } from "@/components/propellerads";
import { WifiOff } from "lucide-react";

import { ServerHero } from "./_components/server-hero";
import { LeaderboardTable } from "./_components/leaderboard-table";
import { StatCard } from "./_components/stat-card";

export const dynamic = "force-dynamic";

interface ServerInfo {
  name?: string;
  icon?: string | null;
  banner?: string | null;
  splash?: string | null;
  description?: string | null;
  memberCount?: number;
  onlineCount?: number;
  inviteUrl?: string | null;
  vanityUrl?: string | null;
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

function extractServerInfo(data: Record<string, unknown>): ServerInfo {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  const source = (d.data?.serverInfo ??
    d.serverInfo ??
    d.data?.guild ??
    d.guild ??
    d.data ??
    d ??
    {}) as Record<string, unknown>;

  return {
    name: source.name as string | undefined,
    icon: source.icon as string | null | undefined,
    banner: source.banner as string | null | undefined,
    splash: source.splash as string | null | undefined,
    description: source.description as string | null | undefined,
    memberCount: (source.humanCount ?? source.memberCount) as
      | number
      | undefined,
    onlineCount: source.onlineCount as number | undefined,
    inviteUrl: source.inviteUrl as string | null | undefined,
    vanityUrl: source.vanityUrl as string | null | undefined,
  };
}

async function fetchLeaderboardData(guildId: string, period: string = "all") {
  let leaderboard: LeaderboardEntry[] = [];
  let isError = false;
  let isPrivate = false;
  let isPremium = false;
  let serverInfo: ServerInfo = {};
  let total = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stats: GuildStats | null = null;

  const botOnline = await checkBotStatus();
  if (!botOnline.online) {
    return {
      leaderboard,
      isError: false,
      isPrivate: false,
      isPremium: false,
      isOffline: true,
      serverInfo,
      total,
      stats,
    };
  }

  try {
    const res = await botFetch(
      `/guilds/${guildId}/leaderboard?limit=50&period=${period}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      isError = true;
      const errorData = await res.json().catch(() => ({}));
      if (
        errorData.hint === "PRIVATE" ||
        errorData.error?.includes("private") ||
        res.status === 403
      ) {
        isPrivate = true;
      }
    } else {
      const resp = await res.json();
      const data = resp.data || resp;
      const rawLeaderboard = data.leaderboard || [];
      isPremium = data.isPremium ?? false;
      serverInfo = extractServerInfo(data.serverInfo || data);
      total = data.total || 0;
      stats = data.stats || null;

      if (Array.isArray(rawLeaderboard)) {
        leaderboard = rawLeaderboard.filter(
          (entry: LeaderboardEntry) => !entry.user?.bot
        );
      } else {
        leaderboard = [];
      }
    }
  } catch (err) {
    console.error("Failed to fetch leaderboard for public page:", err);
    isError = true;
  }

  return {
    leaderboard,
    isError,
    isPrivate,
    isPremium,
    isOffline: false,
    serverInfo,
    total,
    stats,
  };
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ guildId: string }>;
}): Promise<Metadata> {
  const { guildId } = await params;

  let serverName = "Server";
  try {
    const res = await botFetch(`/guilds/${guildId}/leaderboard?limit=1`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const info = extractServerInfo(data);
      if (info.name) serverName = info.name;
    }
  } catch {
    // Fallback to generic name
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://rolereactor.app";

  return {
    title: `${serverName} Leaderboard | Role Reactor`,
    description: `View the top members and XP rankings for ${serverName}. See who's the most active in the community!`,
    openGraph: {
      title: `${serverName} — XP Leaderboard`,
      description: `Check out the most active members in ${serverName}, ranked by experience points.`,
      images: [
        {
          url: `${baseUrl}/og.png`,
          width: 1200,
          height: 630,
          alt: `${serverName} XP Leaderboard`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${serverName} — XP Leaderboard | Role Reactor`,
      description: `Check out the most active members in ${serverName}, ranked by experience points.`,
      images: [`${baseUrl}/og.png`],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PublicLeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ guildId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { guildId } = await params;
  const sp = await searchParams;
  const period = typeof sp.period === "string" ? sp.period : "all";

  const [
    {
      leaderboard,
      isError,
      isPrivate,
      isPremium,
      isOffline,
      serverInfo,
      total,
      stats,
    },
    session,
  ] = await Promise.all([fetchLeaderboardData(guildId, period), auth()]);
  const currentUserId = session?.user?.id ?? undefined;

  if (isOffline) {
    return (
      <main className="min-h-screen relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-zinc-950 pointer-events-none" />
          <BubbleBackground
            interactive={false}
            className="absolute inset-0 opacity-15"
            transition={{ stiffness: 50, damping: 30 }}
            colors={{
              first: "6, 182, 212",
              second: "59, 130, 246",
              third: "139, 92, 246",
              fourth: "99, 102, 241",
              fifth: "14, 165, 233",
              sixth: "6, 182, 212",
            }}
          />
          <div className="absolute inset-0 bg-black/70 pointer-events-none" />
        </div>

        <div className="relative z-10 container max-w-5xl mx-auto py-24 px-4 min-h-[80vh] flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <WifiOff className="w-10 h-10 text-red-500" />
          </div>
          <h1
            className={cn(
              "text-3xl font-black mb-4 uppercase tracking-widest text-zinc-400",
              audiowide.className
            )}
          >
            Service Unavailable
          </h1>
          <p className="text-zinc-500 max-w-md">
            The bot service is currently offline. This leaderboard is
            temporarily unavailable. Please try again in a few minutes.
          </p>
          <Link
            href="/leaderboards"
            className="mt-8 text-sm text-zinc-500 hover:text-cyan-400 transition-colors font-medium inline-flex items-center gap-2"
          >
            ← Browse all leaderboards
          </Link>
        </div>
      </main>
    );
  }

  if (isPrivate) {
    return (
      <main className="container max-w-5xl mx-auto py-24 px-4 min-h-[80vh] flex flex-col items-center justify-center text-center">
        <Lock className="w-16 h-16 text-zinc-700 mb-6" />
        <h1
          className={cn(
            "text-3xl font-black mb-4 uppercase tracking-widest text-zinc-400",
            audiowide.className
          )}
        >
          Private Leaderboard
        </h1>
        <p className="text-zinc-500 max-w-md">
          The administrator of this server has disabled public viewing of the
          leaderboard.
        </p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="container max-w-5xl mx-auto py-24 px-4 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Trophy className="w-16 h-16 text-zinc-800 mb-6" />
        <h1 className={cn("text-3xl font-black mb-4", audiowide.className)}>
          Leaderboard Unavailable
        </h1>
        <p className="text-zinc-500 max-w-md">
          This leaderboard is currently unavailable. The server may not have the
          XP system enabled or may no longer be using Role Reactor.
        </p>
      </main>
    );
  }

  const serverName = serverInfo.name || "Server";
  const inviteLink = serverInfo.inviteUrl || serverInfo.vanityUrl || null;
  const totalRanked = total || 0;
  const { totalXP, highestLevel, averageLevel } = stats || {
    totalXP: leaderboard.reduce((acc, entry) => acc + (entry.totalXP || 0), 0),
    highestLevel:
      leaderboard.length > 0
        ? Math.max(...leaderboard.map((e) => e.level || 0))
        : 0,
    averageLevel:
      leaderboard.length > 0
        ? Math.round(
            leaderboard.reduce((acc, entry) => acc + (entry.level || 0), 0) /
              leaderboard.length
          )
        : 0,
  };
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    process.env.NEXT_PUBLIC_WEBSITE_URL ??
    "https://rolereactor.xyz";
  const pageUrl = `${baseUrl}/leaderboards/${guildId}`;

  return (
    <main className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none" />
        <BubbleBackground
          interactive={false}
          className="absolute inset-0 opacity-15"
          transition={{ stiffness: 50, damping: 30 }}
          colors={{
            first: "6, 182, 212",
            second: "59, 130, 246",
            third: "139, 92, 246",
            fourth: "99, 102, 241",
            fifth: "14, 165, 233",
            sixth: "6, 182, 212",
          }}
        />
        <div className="absolute inset-0 bg-black/70 pointer-events-none" />
      </div>

      <div className="relative z-10 container max-w-5xl mx-auto py-16 px-4">
        <ServerHero
          guildId={guildId}
          serverName={serverName}
          serverInfo={serverInfo || {}}
          isPremium={isPremium}
          leaderboardCount={totalRanked}
          memberCount={serverInfo?.memberCount}
          inviteLink={inviteLink}
          pageUrl={pageUrl}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="Ranked Members"
            value={leaderboard.length.toLocaleString()}
          />
          <StatCard
            icon={<Crown className="w-4 h-4" />}
            label="Highest Level"
            value={(highestLevel ?? 0).toString()}
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Average Level"
            value={(averageLevel ?? 0).toString()}
          />
          <StatCard
            icon={<Trophy className="w-4 h-4" />}
            label="Total XP Earned"
            value={formatCompact(totalXP ?? 0)}
          />
        </div>

        <ConditionalAdBlock
          zoneId={
            process.env.NEXT_PUBLIC_PROPELLERADS_LEADERBOARD_TOP_ZONE || ""
          }
          className="mb-8"
          hide={isPremium}
        />

        <LeaderboardTable
          leaderboard={leaderboard}
          currentUserId={currentUserId}
          period={period}
        />

        <ConditionalAdBlock
          zoneId={
            process.env.NEXT_PUBLIC_PROPELLERADS_LEADERBOARD_BOTTOM_ZONE || ""
          }
          className="mt-12"
          hide={isPremium}
        />

        <div className="mt-8 text-center">
          <Link
            href="/leaderboards"
            className="text-sm text-zinc-500 hover:text-cyan-400 transition-colors font-medium inline-flex items-center gap-2"
            prefetch={false}
          >
            ← Browse all leaderboards
          </Link>
        </div>
      </div>
    </main>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCompact(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}
