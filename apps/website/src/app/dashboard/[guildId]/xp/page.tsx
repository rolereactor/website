"use client";

import { useState, use, useEffect, useRef } from "react";
import { Audiowide } from "next/font/google";
import {
  Trophy,
  Settings as SettingsIcon,
  Search,
  Save,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useXPStore, type LeaderboardEntry } from "@/store/use-xp-store";
import { useServerStore } from "@/store/use-server-store";
import { useProEngineStore } from "@/store/use-pro-engine-store";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/app/dashboard/_components/page-header";
import { StatePanel } from "@/components/common/state-panel";
import { Button } from "@/components/ui/button";

import { NodeLoader } from "@/components/common/node-loader";
import { StatsGrid } from "./_components/stats";
import { LeaderboardList } from "./_components/leaderboard";
import { XPSettingsTab } from "./_components/settings";
import { XPDisabledState, EmptyState } from "./_components/states";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface XPPageProps {
  params: Promise<{ guildId: string }>;
}

export default function XPPage({ params }: XPPageProps) {
  const { guildId } = use(params);
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const settingsRef = useRef<{
    handleSave: () => Promise<void>;
    saving: boolean;
  }>(null);

  const { getGuildData, dataCache, isLoading, isError, fetchXPData } =
    useXPStore();

  // Get data for THIS specific guild
  const hasGuildData = guildId in dataCache;
  const { leaderboard, settings, isXpDisabled } = getGuildData(guildId);

  const { guilds } = useServerStore();
  const { fetchSettings, settingsCache } = useProEngineStore();

  const activeGuild = guilds.find((g) => g.id === guildId);
  const guildName = activeGuild?.name || "this server";

  // Get premium status
  const premiumStatus = settingsCache[guildId] ?? null;
  const isPremium = premiumStatus?.isPremium?.pro || false;

  // Handle Initial Fetch — force refresh on guild change
  useEffect(() => {
    if (guildId) {
      // Let the stores decide based on their TTL caches (5 min)
      fetchXPData(guildId);
      fetchSettings(guildId);
    }
  }, [guildId, fetchXPData, fetchSettings]);

  const filteredLeaderboard = leaderboard.filter((entry: LeaderboardEntry) =>
    entry.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const averageLevel =
    leaderboard.length > 0
      ? Math.round(
          leaderboard.reduce(
            (acc: number, curr: LeaderboardEntry) => acc + curr.level,
            0
          ) / leaderboard.length
        )
      : 0;

  // Show loader if this guild has never been fetched, or if actively loading with no data
  const isInitialLoading =
    !hasGuildData || (isLoading && !leaderboard.length && !settings);

  if (isInitialLoading) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-background">
        <NodeLoader
          title="Loading Dashboard"
          subtitle="Synchronizing your data..."
        />
      </div>
    );
  }

  if (isError && !leaderboard.length && !isXpDisabled) {
    return (
      <div className="space-y-6 w-full">
        <PageHeader
          category="Engagement Management"
          categoryIcon={Trophy}
          title="XP & Levels"
          description="Monitor community activity and manage leveling rewards for"
          serverName={guildName}
        />
        <StatePanel
          variant="error"
          icon={AlertTriangle}
          title="System Alert"
          description={isError.message || "Failed to load XP data."}
          actionLabel="Try Again"
          onAction={() => fetchXPData(guildId, true)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        category="Engagement Management"
        categoryIcon={Trophy}
        title="XP & Levels"
        description="Monitor community activity and manage leveling rewards for"
        serverName={guildName}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full min-w-0"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] items-center gap-4 mb-6 min-w-0 px-1">
          <TabsList variant="neon" className="w-full lg:w-auto flex min-w-0">
            <TabsTrigger
              value="leaderboard"
              variant="neon"
              className={cn(
                "flex-1 lg:flex-none gap-2 min-w-0",
                audiowide.className
              )}
            >
              <Trophy className="w-4 h-4" />
              <span className="truncate">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              variant="neon-purple"
              className={cn(
                "flex-1 lg:flex-none gap-2 min-w-0",
                audiowide.className
              )}
            >
              <SettingsIcon className="w-4 h-4" />
              <span className="truncate">Settings</span>
            </TabsTrigger>
          </TabsList>

          {activeTab === "leaderboard" && (
            <div className="relative w-full lg:max-w-md lg:justify-self-end group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within/search:text-cyan-400 transition-colors" />
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="search"
                className={cn("pl-11 w-full", audiowide.className)}
              />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="flex items-center gap-3 w-full sm:w-auto lg:justify-self-end">
              <Button
                variant="cyber"
                size="lg"
                className="w-full sm:w-auto h-10 px-6 font-black uppercase tracking-widest text-[11px]"
                onClick={() => settingsRef.current?.handleSave()}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="mr-2 h-3.5 w-3.5" />
                )}
                Push Settings
              </Button>
            </div>
          )}
        </div>

        <TabsContent
          value="leaderboard"
          className="mt-0 focus-visible:outline-none min-h-125 w-full overflow-hidden"
        >
          {isXpDisabled ? (
            <XPDisabledState onEnable={() => setActiveTab("settings")} />
          ) : leaderboard.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-6">
              <StatsGrid
                leaderboard={leaderboard}
                averageLevel={averageLevel}
              />
              <LeaderboardList
                leaderboard={leaderboard}
                filteredLeaderboard={filteredLeaderboard}
                searchQuery={searchQuery}
                isPremium={isPremium}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="settings"
          className="mt-0 focus-visible:outline-none"
        >
          <XPSettingsTab
            ref={settingsRef}
            guildId={guildId}
            onSavingChange={setIsSaving}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
