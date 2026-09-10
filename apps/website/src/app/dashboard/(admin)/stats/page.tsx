import type { Metadata } from "next";
import { botFetchJson } from "@/lib/bot-fetch";
import { PageHeader } from "@/app/dashboard/_components/page-header";

export const metadata: Metadata = {
  title: "Global Stats | Admin Console",
  description: "Global system performance and metrics",
};
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Server,
  Activity,
  AlertTriangle,
  Terminal,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { cn, formatCompactNumber } from "@/lib/utils";
import { StatePanel } from "@/components/common/state-panel";
import { Suspense, lazy } from "react";
import { NodeLoader } from "@/components/common/node-loader";

const LazyStatsChart = lazy(() =>
  import("./_components/stats-chart").then((mod) => ({
    default: mod.StatsChart,
  }))
);

interface BotStats {
  bot: {
    id: string;
    username: string;
    tag: string;
  };
  statistics: {
    guilds: number;
    users: number;
  };
}

interface ActiveUsers {
  dau: number;
  mau: number;
  total: number;
}

interface CommandUsage {
  commands: Array<{
    name: string;
    count: number;
    lastUsed?: string;
  }>;
  summary: {
    totalCommands: number;
    totalExecutions: number;
  };
}

interface GuildCountHistory {
  current: {
    guilds: number;
    users: number;
    date: string;
  } | null;
  history: Array<{
    date: string;
    guilds: number;
    users: number;
  }>;
}

async function getStats() {
  try {
    return await botFetchJson<BotStats>("/stats", {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
  } catch (error) {
    console.error("Failed to fetch bot stats:", error);
    return null;
  }
}

async function getCommandUsage() {
  try {
    return await botFetchJson<CommandUsage>("/commands/usage?limit=5", {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
  } catch (error) {
    console.error("Failed to fetch command usage:", error);
    return null;
  }
}

async function getActiveUsers() {
  try {
    return await botFetchJson<{ activeUsers: ActiveUsers }>(
      "/stats/active-users",
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );
  } catch (error) {
    console.error("Failed to fetch active users:", error);
    return null;
  }
}

async function getGuildCountHistory() {
  try {
    return await botFetchJson<GuildCountHistory>("/stats/guild-count?days=7", {
      next: { revalidate: 300 },
    });
  } catch (error) {
    console.error("Failed to fetch guild count history:", error);
    return null;
  }
}

function calcTrend(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "New" : "—";
  const change = current - previous;
  const pct = ((change / previous) * 100).toFixed(1);
  return change >= 0 ? `+${pct}%` : `${pct}%`;
}

function StatsLoader() {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background">
      <NodeLoader
        title="Loading Dashboard"
        subtitle="Synchronizing your data..."
      />
    </div>
  );
}

async function StatsContent() {
  const [stats, usage, activeUsers, guildCountHistory] = await Promise.all([
    getStats(),
    getCommandUsage(),
    getActiveUsers(),
    getGuildCountHistory(),
  ]);

  // Calculate real trends from guild count history
  const history = guildCountHistory?.history || [];
  const guildTrend =
    history.length >= 2
      ? calcTrend(history[history.length - 1].guilds, history[0].guilds)
      : null;
  const userTrend =
    history.length >= 2
      ? calcTrend(history[history.length - 1].users, history[0].users)
      : null;

  if (!stats) {
    return (
      <StatePanel
        variant="error"
        icon={AlertTriangle}
        title="Service Unavailable"
        description="Unable to fetch dashboard statistics from the bot."
      />
    );
  }

  return (
    <>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Guilds"
          value={formatCompactNumber(stats.statistics.guilds)}
          icon={Server}
          description="Total Discord installations"
          trend={guildTrend || undefined}
          color="cyan"
        />
        <StatCard
          title="Total Users"
          value={formatCompactNumber(stats.statistics.users)}
          icon={Users}
          description="Unique users across all servers"
          trend={userTrend || undefined}
          color="fuchsia"
        />
        <StatCard
          title="Daily Active"
          value={formatCompactNumber(activeUsers?.activeUsers.dau || 0)}
          icon={Activity}
          description="Users active in last 24h"
          color="emerald"
        />
        <StatCard
          title="Monthly Active"
          value={formatCompactNumber(activeUsers?.activeUsers.mau || 0)}
          icon={Users}
          description="Users active in last 30 days"
          color="cyan"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Executions"
          value={formatCompactNumber(usage?.summary.totalExecutions || 0)}
          icon={Terminal}
          description="Total commands processed"
          color="emerald"
        />
        <StatCard
          title="System Status"
          value="OPTIMAL"
          icon={ShieldCheck}
          description="All processes operational"
          color="amber"
          isStatus
        />
        <StatCard
          title="Engagement Rate"
          value={
            stats.statistics.users > 0
              ? `${Math.round(((activeUsers?.activeUsers.dau || 0) / stats.statistics.users) * 100)}%`
              : "0%"
          }
          icon={Activity}
          description="DAU / Total Users ratio"
          color="fuchsia"
        />
        <StatCard
          title="Retention"
          value={
            activeUsers?.activeUsers.mau && activeUsers.activeUsers.mau > 0
              ? `${Math.round(((activeUsers.activeUsers.dau || 0) / activeUsers.activeUsers.mau) * 100)}%`
              : "0%"
          }
          icon={Users}
          description="DAU / MAU retention ratio"
          color="cyan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Command Usage Chart */}
        <Card showGrid className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>
                  Most utilized features in the last 24h
                </CardDescription>
              </div>
              <Terminal className="size-5 text-cyan-500 opacity-50" />
            </div>
          </CardHeader>
          <CardContent className="h-75 w-full pt-4">
            <Suspense
              fallback={
                <div className="h-full w-full bg-zinc-900/10 animate-pulse rounded-xl" />
              }
            >
              <LazyStatsChart data={usage?.commands || []} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Top Commands List */}
        <Card variant="cyberpunk">
          <CardHeader>
            <CardTitle className="text-lg">Popular Features</CardTitle>
            <CardDescription>Most active modules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {usage?.commands.map((cmd) => (
              <div
                key={cmd.name}
                className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-cyan-500/10 text-cyan-500 group-hover:scale-110 transition-transform">
                    <Terminal className="size-4" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-bold text-zinc-200 uppercase">
                      {cmd.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 italic uppercase tracking-tighter">
                      High usage
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-cyan-400 font-mono">
                    {formatCompactNumber(cmd.count)}
                  </p>
                  <p className="text-[9px] text-zinc-600 font-mono tracking-widest uppercase">
                    USES
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default async function AdminStatsPage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        category="Developer Access"
        categoryIcon={Activity}
        title="Global Statistics"
        description="Monitor system-wide bot performance and user growth metrics."
      />

      <Suspense fallback={<StatsLoader />}>
        <StatsContent />
      </Suspense>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "cyan",
  isStatus = false,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  trend?: string;
  color?: "cyan" | "fuchsia" | "emerald" | "amber";
  isStatus?: boolean;
}) {
  const colorMap = {
    cyan: "text-cyan-400 shadow-cyan-400/20",
    fuchsia: "text-fuchsia-400 shadow-fuchsia-400/20",
    emerald: "text-emerald-400 shadow-emerald-400/20",
    amber: "text-amber-400 shadow-amber-400/20",
  };

  const bgMap = {
    cyan: "bg-cyan-400/10 border-cyan-400/20",
    fuchsia: "bg-fuchsia-400/10 border-fuchsia-400/20",
    emerald: "bg-emerald-400/10 border-emerald-400/20",
    amber: "bg-amber-400/10 border-amber-400/20",
  };

  return (
    <Card
      variant="cyberpunk"
      className="group border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-1"
    >
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "p-2 rounded-lg border transition-all duration-500 group-hover:scale-110",
              bgMap[color]
            )}
          >
            <Icon className={cn("size-5", colorMap[color])} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-mono bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
              <ArrowUpRight className="size-3" />
              {trend}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">
            {title}
          </p>
          <h2
            className={cn(
              "text-3xl font-black tracking-tighter font-mono italic",
              isStatus ? colorMap[color] : "text-white"
            )}
          >
            {value}
          </h2>
        </div>

        <p className="text-[10px] text-zinc-600 font-medium leading-relaxed italic border-t border-white/5 pt-3">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
