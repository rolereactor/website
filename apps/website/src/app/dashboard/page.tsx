import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { OverviewLanding } from "@/app/dashboard/_components/overview-landing";
import { SystemHealth } from "@/app/dashboard/_components/system-health";
import { isDeveloper } from "@/lib/admin";
import { getManageableGuilds } from "@/lib/server/guilds";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, Zap, Terminal, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { botFetchJson } from "@/lib/bot-fetch";
import { formatCompactNumber } from "@/lib/utils";
import { TerminalLogsPreview } from "@/app/dashboard/_components/terminal-logs-preview";

interface BotStats {
  statistics?: {
    guilds?: number;
  };
}

interface CommandUsage {
  summary?: {
    totalExecutions?: number;
  };
}

interface RevenueStats {
  summary?: {
    totalRevenue?: number;
  };
}

export default async function DashboardPage() {
  const session = await auth();

  // 1. Basic auth check
  if (!session?.user) {
    notFound();
  }

  // 2. Developer/Admin View Fast-Pass
  if (isDeveloper(session.user)) {
    let guildsCount = 0;
    let totalExecutions = 0;
    let totalRevenue = 0;

    try {
      const [statsData, usageData, revenueData] = await Promise.all([
        botFetchJson<BotStats>("/stats", { next: { revalidate: 60 }, silent: true }),
        botFetchJson<CommandUsage>("/commands/usage", { userId: session.user.id, next: { revalidate: 60 }, silent: true }),
        botFetchJson<RevenueStats>("/payments/stats", { userId: session.user.id, next: { revalidate: 60 }, silent: true }),
      ]);
      guildsCount = statsData?.statistics?.guilds || 0;
      totalExecutions = usageData?.summary?.totalExecutions || 0;
      totalRevenue = revenueData?.summary?.totalRevenue || 0;
    } catch {
      // Fallback if bot API is offline
    }

    const guildsStatText = guildsCount > 0 ? `${formatCompactNumber(guildsCount)} GUILDS` : "LIVE METRICS";
    const revenueStatText = totalRevenue > 0 ? `$${formatCompactNumber(totalRevenue)} TOTAL` : "$0 TOTAL";
    const usesStatText = totalExecutions > 0 ? `${formatCompactNumber(totalExecutions)} USES` : "0 USES";

    return (
      <div className="space-y-6 w-full">
        {/* Hero Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OverviewNavCard
            title="Global Statistics"
            description="Global bot statistics, server count and user growth metrics."
            href="/dashboard/stats"
            icon={BarChart3}
            color="cyan"
            stats={guildsStatText}
          />
          <OverviewNavCard
            title="Revenue & Billing"
            description="Revenue tracking, payment history and system financial health."
            href="/dashboard/revenue"
            icon={Zap}
            color="emerald"
            stats={revenueStatText}
          />
          <OverviewNavCard
            title="System Analytics"
            description="Internal command analytics and module utilization logs."
            href="/dashboard/commands"
            icon={Terminal}
            color="fuchsia"
            stats={usesStatText}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* System Health */}
          <SystemHealth />

          {/* Console Logs Preview */}
          <TerminalLogsPreview />
        </div>
      </div>
    );
  }

  // 3. Regular User View Fast-Pass
  // We check if they have guilds with the bot installed on the server
  const { installedGuildIds } = await getManageableGuilds();

  if (installedGuildIds.length > 0) {
    // Instant redirect to the first installed guild found
    redirect(`/dashboard/${installedGuildIds[0]}`);
  }

  // 4. Default: Show Onboarding
  return (
    <div className="space-y-6 w-full">
      <OverviewLanding />
    </div>
  );
}

interface OverviewNavCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "cyan" | "emerald" | "fuchsia";
  stats: string;
}

function OverviewNavCard({
  title,
  description,
  href,
  icon: Icon,
  color,
  stats,
}: OverviewNavCardProps) {
  const colors = {
    cyan: "text-cyan-400 border-cyan-500/20 group-hover:border-cyan-500/50 bg-cyan-500/5",
    emerald:
      "text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500/50 bg-emerald-500/5",
    fuchsia:
      "text-fuchsia-400 border-fuchsia-500/20 group-hover:border-fuchsia-500/50 bg-fuchsia-500/5",
  };

  return (
    <Link href={href}>
      <Card
        variant="cyberpunk"
        className={cn(
          "group h-full transition-all duration-500",
          colors[color as keyof typeof colors]
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
              <Icon className="size-5" />
            </div>
            <ArrowRight className="size-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </div>
          <CardTitle className="text-lg uppercase italic font-black">
            {title}
          </CardTitle>
          <CardDescription className="text-[10px] font-medium leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-current animate-pulse" />
            <span className="text-xs font-mono font-black tracking-widest uppercase">
              {stats}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
