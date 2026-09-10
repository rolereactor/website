import type { Metadata } from "next";
import { botFetchJson } from "@/lib/bot-fetch";
import { PageHeader } from "@/app/dashboard/_components/page-header";

export const metadata: Metadata = {
  title: "Command Analytics | Admin Console",
  description: "Configure global system commands and responses",
};
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Terminal,
  Activity,
  AlertTriangle,
  Cpu,
  Layers,
  Zap,
  MousePointer2,
  ListFilter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatePanel } from "@/components/common/state-panel";
import { Suspense, lazy } from "react";
import { NodeLoader } from "@/components/common/node-loader";
import { ScrollArea } from "@/components/ui/scroll-area";

const LazyCommandChart = lazy(() =>
  import("./_components/command-chart").then((mod) => ({
    default: mod.CommandUsageChart,
  }))
);

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

async function getCommandUsage() {
  try {
    const result = await botFetchJson<CommandUsage>(
      "/commands/usage?limit=50",
      {
        silent: true,
      }
    );
    return result;
  } catch (error) {
    // Silently fail and return null - the UI will handle this gracefully
    console.warn(
      "[Commands Page] Failed to fetch command usage:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

function CommandsLoader() {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background">
      <NodeLoader
        title="Loading Dashboard"
        subtitle="Synchronizing your data..."
      />
    </div>
  );
}

async function CommandsContent() {
  let usage = null;

  try {
    usage = await getCommandUsage();
  } catch (error) {
    // Catch any unexpected errors
    console.error("[Commands Page] Unexpected error:", error);
  }

  if (!usage) {
    return (
      <StatePanel
        variant="error"
        icon={AlertTriangle}
        title="Service Unavailable"
        description="Unable to load command usage data from the bot."
      />
    );
  }

  const validCommands = (usage.commands || []).filter(
    (cmd) => Boolean(cmd?.name && typeof cmd.name === "string" && cmd.name.trim().length > 0)
  );

  return (
    <>
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Executions"
          value={(usage.summary?.totalExecutions ?? 0).toLocaleString()}
          icon={Cpu}
          description="Total commands processed by the bot system"
          color="cyan"
        />
        <MetricCard
          title="Active Commands"
          value={validCommands.length.toString()}
          icon={Layers}
          description="Available system command modules"
          color="fuchsia"
        />
        <MetricCard
          title="System Status"
          value="STABLE"
          icon={Activity}
          description="Current operational status"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Full Usage Chart */}
        <Card showGrid className="h-fit">
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>
              Command usage distribution across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="h-115 pt-4">
            <Suspense
              fallback={
                <div className="h-full w-full bg-zinc-900/10 animate-pulse rounded-xl" />
              }
            >
              <LazyCommandChart data={validCommands.slice(0, 10)} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Breakdown List */}
        <div className="space-y-6">
          <Card variant="cyberpunk" className="bg-zinc-950/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl italic">
                  Command Breakdown
                </CardTitle>
                <CardDescription>
                  Usage statistics per specific command
                </CardDescription>
              </div>
              <ListFilter className="size-4 text-zinc-600" />
            </CardHeader>
            <CardContent className="overflow-hidden">
              <ScrollArea className="h-107.5 pr-4">
                {validCommands.map((cmd, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between p-3 mb-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/20 rounded-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-zinc-600 font-black w-4">
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                      <div className="p-2 bg-zinc-900 rounded group-hover:scale-110 transition-transform">
                        <Terminal className="size-4 text-cyan-500" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-bold text-zinc-100 uppercase tracking-tighter group-hover:text-cyan-400 transition-colors">
                          /{cmd.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-[8px] h-3 px-1 border-emerald-500/20 text-emerald-500 font-black tracking-widest uppercase"
                          >
                            ACTIVE
                          </Badge>
                          <span className="text-[9px] text-zinc-700 font-mono italic">
                            Default Category
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-lg font-black font-mono text-white tracking-tighter">
                          {(cmd.count ?? 0).toLocaleString()}
                        </span>
                        <Zap className="size-3 text-amber-500 animate-pulse" />
                      </div>
                      <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">
                        Invocations
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* System Hint Card */}
          <Card variant="glass" className="border-cyan-500/10 bg-cyan-500/5">
            <CardContent className="pt-6 flex gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-full h-fit self-start">
                <MousePointer2 className="size-5 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                  System Note
                </p>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                  Command performance is currently within expected parameters.
                  High-usage modules should be monitored for latency or rate
                  limit issues.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default async function AdminCommandsPage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        category="Developer Access"
        categoryIcon={Activity}
        title="Command Usage"
        description="Monitor global command execution and performance analytics across all Discord servers."
      />

      <Suspense fallback={<CommandsLoader />}>
        <CommandsContent />
      </Suspense>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  color = "cyan",
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color?: "cyan" | "fuchsia" | "emerald";
}) {
  const colorMap = {
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    fuchsia: "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20",
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  };

  return (
    <Card variant="cyberpunk" className="group">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase font-black mb-1">
              {title}
            </p>
            <h2 className="text-3xl font-black tracking-tighter text-white font-mono italic">
              {value}
            </h2>
          </div>
          <div
            className={cn(
              "p-2 rounded-lg border",
              colorMap[color as keyof typeof colorMap]
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>
        <p className="text-[10px] text-zinc-600 mt-4 pt-4 border-t border-white/5 italic">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
