"use client";

import { PremiumGuard } from "../../../_components/premium-guard";
import { DiscordCommand } from "@/types/discord";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatePanel } from "@/components/common/state-panel";
import { NodeLoader } from "@/components/common/node-loader";
import { useProEngineStore } from "@/store/use-pro-engine-store";
import {
  Search,
  CircleHelp,
  MessageCircle,
  UserCircle,
  Zap,
  HelpCircle,
  Sparkles,
  UserPlus,
  Trophy,
  BarChart,
  Signal,
  Vote,
  Gamepad2,
  Server,
  LifeBuoy,
  User,
  Split,
  Terminal,
  Lock,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "@/lib/toast";
import { Audiowide } from "next/font/google";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "8ball": CircleHelp,
  ask: MessageCircle,
  avatar: UserCircle,
  core: Zap,
  help: HelpCircle,
  imagine: Sparkles,
  invite: UserPlus,
  leaderboard: Trophy,
  level: BarChart,
  ping: Signal,
  poll: Vote,
  rps: Gamepad2,
  serverinfo: Server,
  support: LifeBuoy,
  userinfo: User,
  wyr: Split,
};

const categoryIconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Admin: Shield,
  Developer: Terminal,
  General: HelpCircle,
};

interface CommandListProps {
  guildId: string;
  title?: React.ReactNode;
  description?: string;
}

export function CommandList({ guildId }: CommandListProps) {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const {
    settingsCache,
    isLoading,
    isError,
    fetchSettings,
    updateLocalSettings,
  } = useProEngineStore();

  const data = settingsCache[guildId] ?? null;

  // Handle Initial Fetch
  useEffect(() => {
    if (guildId) {
      fetchSettings(guildId);
    }
  }, [guildId, fetchSettings]);

  const toggleCommand = async (commandName: string) => {
    if (!data || data.status !== "success") return;

    // Safety check: if not premium, don't allow toggling
    if (!data.isPremium?.pro) {
      setShowPremiumModal(true);
      return;
    }

    const currentDisabled = data.settings.disabledCommands || [];
    const isCurrentlyDisabled = currentDisabled.includes(commandName);

    let newDisabled;
    if (isCurrentlyDisabled) {
      newDisabled = currentDisabled.filter(
        (name: string) => name !== commandName
      );
    } else {
      newDisabled = [...currentDisabled, commandName];
    }

    // Optimistic update
    if (data) {
      updateLocalSettings({
        settings: {
          ...data.settings,
          disabledCommands: newDisabled,
        },
      });
    }

    try {
      const res = await fetch(`/api/guilds/${guildId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabledCommands: newDisabled }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Update failed");
      }

      await fetchSettings(guildId, true); // Revalidate
    } catch (err: unknown) {
      console.error("Failed to update settings:", err);
      const message =
        err instanceof Error ? err.message : "Failed to update command status";
      toast.error(message);
      await fetchSettings(guildId, true); // Revert on error
    }
  };

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
      await fetchSettings(guildId, true); // Refresh status
    } catch (err: unknown) {
      console.error("Failed to activate premium:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Insufficient Cores or activation error";
      toast.error(message);
    } finally {
      setIsActivating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-background">
        <NodeLoader
          title="Loading Dashboard"
          subtitle="Synchronizing your data..."
        />
      </div>
    );
  }

  const commands = data?.availableCommands || [];
  const disabledCommands = data?.settings?.disabledCommands || [];
  const isPremium = data?.isPremium?.pro;

  const filteredCommands = commands.filter(
    (cmd: DiscordCommand) =>
      cmd.name.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce(
    (acc: Record<string, DiscordCommand[]>, cmd: DiscordCommand) => {
      const cat = cmd.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(cmd);
      return acc;
    },
    {} as Record<string, DiscordCommand[]>
  );

  const sortedCategories = Object.keys(groupedCommands).sort();

  return (
    <>
      <PremiumGuard
        open={showPremiumModal}
        onOpenChange={setShowPremiumModal}
        onActivate={handleActivatePremium}
        isActivating={isActivating}
        title="ACTIVATE PRO ENGINE"
        description="Take full control of your server's slash commands. Manage command visibility to maintain a streamlined interface."
        features={[
          "Toggle Any Command",
          "Declutter Slash Menu",
          "Instant Updates",
          "Server Protection",
        ]}
      />

      <div className="space-y-6 relative">
        {/* Search & Status Bar */}
        <div className="sticky top-4 z-40 flex flex-wrap flex-col md:flex-row gap-4 items-center justify-between bg-zinc-950/80 p-4 rounded-2xl border border-white/10 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden group/search">
          <div className="absolute inset-0 bg-linear-to-r from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none opacity-50" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent" />

          <div className="relative w-full flex-1 min-w-3xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within/search:text-cyan-400 transition-colors" />
            <Input
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "pl-11 bg-zinc-900/50 border-white/5 h-10 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all rounded-lg font-bold placeholder:text-zinc-700 tracking-wide text-zinc-300",
                audiowide.className
              )}
            />
          </div>

          <div className="flex items-center gap-3 text-sm whitespace-nowrap overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {isPremium ? (
              <>
                <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 px-4 py-1.5 rounded-lg shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)] backdrop-blur-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Active:
                  </span>
                  <span
                    className={cn(
                      "text-emerald-300 font-bold",
                      audiowide.className
                    )}
                  >
                    {commands.length - disabledCommands.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 px-4 py-1.5 rounded-lg shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)] backdrop-blur-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
                  <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                    Disabled:
                  </span>
                  <span
                    className={cn(
                      "text-red-300 font-bold",
                      audiowide.className
                    )}
                  >
                    {disabledCommands.length}
                  </span>
                </div>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="bg-amber-500/5 border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/40 uppercase tracking-widest font-black text-[10px]"
                onClick={() => setShowPremiumModal(true)}
              >
                <Crown className="w-3.5 h-3.5 mr-2" />
                Locked
              </Button>
            )}
          </div>
        </div>

        <div className="relative space-y-8">
          {(isError && !data) || (data && data.status !== "success") ? (
            <StatePanel
              variant="error"
              icon={AlertTriangle}
              title="Data Synchronization Failed"
              description="Failed to load command settings. Please try again later."
              actionLabel="Try Again"
              onAction={() => fetchSettings(guildId, true)}
            />
          ) : (
            <>
              {sortedCategories.map((category) => {
                const CategoryIcon = categoryIconMap[category] || Terminal;
                return (
                  <div key={category} className="space-y-6">
                    <div className="flex items-center gap-4 group/cat">
                      <div className="p-2.5 bg-zinc-900 rounded-xl border border-white/10 text-cyan-500 group-hover/cat:border-cyan-500/50 group-hover/cat:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300">
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <h3
                        className={cn(
                          "text-xl font-black text-white tracking-widest uppercase flex items-center gap-4",
                          audiowide.className
                        )}
                      >
                        {category}
                      </h3>
                      <div className="h-px bg-linear-to-r from-cyan-500/50 via-zinc-800 to-transparent flex-1 opacity-30 group-hover/cat:opacity-100 transition-opacity duration-500" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {groupedCommands[category].map((cmd: DiscordCommand) => {
                        const Icon = iconMap[cmd.name] || Terminal;
                        const isDisabled = disabledCommands.includes(cmd.name);

                        return (
                          <Card
                            key={cmd.name}
                            variant={isDisabled ? "default" : "cyberpunk"}
                            className={cn(
                              "p-5 transition-all duration-300 relative overflow-hidden",
                              isDisabled
                                ? "opacity-60 grayscale-[0.8] border-white/5 bg-zinc-950/40"
                                : "hover:-translate-y-1 hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.5)]"
                            )}
                          >
                            <div className="flex flex-row items-start justify-between gap-4 mb-4">
                              <div
                                className={cn(
                                  "p-3 rounded-xl transition-all duration-300 border",
                                  isDisabled
                                    ? "bg-zinc-800/50 border-white/5 text-zinc-500"
                                    : "bg-cyan-500/5 border-cyan-500/20 text-cyan-400 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                                )}
                              >
                                <Icon className="w-5 h-5" />
                              </div>

                              <button
                                onClick={() => toggleCommand(cmd.name)}
                                className={cn(
                                  "w-12 h-6 rounded-full relative transition-all duration-300 p-0.5 border cursor-pointer",
                                  isDisabled
                                    ? "bg-zinc-950 border-zinc-700"
                                    : "bg-cyan-950/50 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                )}
                              >
                                <div className="absolute inset-0 rounded-full bg-cyan-500/10 opacity-0 transition-opacity" />
                                <div
                                  className={cn(
                                    "w-4 h-4 rounded-full transition-all duration-300 shadow-sm relative z-10",
                                    isDisabled
                                      ? "translate-x-1 bg-zinc-600"
                                      : "translate-x-7 bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                                  )}
                                />
                              </button>
                            </div>

                            <div className="space-y-2 relative z-10">
                              <div className="flex items-center gap-2">
                                <h4
                                  className={cn(
                                    "text-sm font-black text-white truncate transition-colors uppercase tracking-wider",
                                    !isDisabled && "group-hover:text-cyan-400",
                                    audiowide.className
                                  )}
                                >
                                  /{cmd.name}
                                </h4>
                                {isDisabled && (
                                  <Lock className="w-3 h-3 text-zinc-600" />
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed font-medium h-8 group-hover:text-zinc-400 transition-colors">
                                {cmd.description}
                              </p>
                            </div>

                            {/* Hover Effects */}
                            {!isDisabled && (
                              <>
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyan-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                              </>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredCommands.length === 0 && (
                <StatePanel
                  variant="empty"
                  icon={Search}
                  title="No results found"
                  description="We couldn't find any commands matching your search."
                  actionLabel="Clear Search"
                  onAction={() => setSearch("")}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

type ShieldProps = React.SVGProps<SVGSVGElement>;

function Shield(props: ShieldProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}
