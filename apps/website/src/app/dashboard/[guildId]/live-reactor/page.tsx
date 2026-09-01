"use client";

import { useState, use, useEffect, useCallback } from "react";
import { Radio } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { useStreamingStore } from "@/store/use-streaming-store";
import { useServerStore } from "@/store/use-server-store";

import { PageHeader } from "@/app/dashboard/_components/page-header";
import { NodeLoader } from "@/components/common/node-loader";

import { LiveReactorNav } from "./_components/live-reactor-nav";
import { ConnectionPanel } from "./_components/connection-panel";
import { ConfigPanel } from "./_components/config-panel";
import { CommandsPanel } from "./_components/commands-panel";
import { FiltersPanel } from "./_components/filters-panel";
import { QuotesPanel } from "./_components/quotes-panel";
import { TimersPanel } from "./_components/timers-panel";
import { DiagnosticsPanel } from "./_components/diagnostics-panel";

interface StreamingPageProps {
  params: Promise<{ guildId: string }>;
}

export default function StreamingPage({ params }: StreamingPageProps) {
  const { guildId } = use(params);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "connection");
  const [isInitialized, setIsInitialized] = useState(false);

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      window.history.replaceState(
        null,
        "",
        `/dashboard/${guildId}/live-reactor?tab=${tab}`
      );
    },
    [guildId]
  );

  const {
    isLoading,
    statusCache,
    fetchStatus,
    fetchConfig,
    fetchCommands,
    fetchFilters,
    fetchQuotes,
    fetchTimers,
    fetchDiag,
  } = useStreamingStore();

  const { guilds } = useServerStore();
  const activeGuild = guilds.find((g) => g.id === guildId);
  const guildName = activeGuild?.name || "this server";

  const isAnyLoading = Object.entries(isLoading).some(
    ([k, v]) => k.endsWith(`:${guildId}`) && v
  );

  useEffect(() => {
    if (!guildId) return;

    // Fetch primary status and config; non-critical items fetch in background
    Promise.allSettled([
      fetchStatus(guildId),
      fetchConfig(guildId),
      fetchCommands(guildId),
      fetchFilters(guildId),
      fetchQuotes(guildId),
      fetchTimers(guildId),
      fetchDiag(guildId),
    ]).finally(() => setIsInitialized(true));
  }, [
    guildId,
    fetchStatus,
    fetchConfig,
    fetchCommands,
    fetchFilters,
    fetchQuotes,
    fetchTimers,
    fetchDiag,
  ]);

  const isInitialLoading = !isInitialized && isAnyLoading;
  const connections = statusCache[guildId] || [];
  const isConnected = connections.some((c) => c.isConnected);
  const isLive = connections.some((c) => c.isConnected && c.isLive);

  if (isInitialLoading) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-background">
        <NodeLoader
          title="Loading Live Reactor"
          subtitle="Connecting to streaming services..."
        />
      </div>
    );
  }

  const renderPanel = () => {
    switch (activeTab) {
      case "connection":
        return <ConnectionPanel guildId={guildId} />;
      case "config":
        return <ConfigPanel guildId={guildId} />;
      case "commands":
        return <CommandsPanel guildId={guildId} />;
      case "filters":
        return <FiltersPanel guildId={guildId} />;
      case "quotes":
        return <QuotesPanel guildId={guildId} />;
      case "timers":
        return <TimersPanel guildId={guildId} />;
      case "diagnostics":
        return <DiagnosticsPanel guildId={guildId} />;
      default:
        return <ConnectionPanel guildId={guildId} />;
    }
  };

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        category="Engagement Management"
        categoryIcon={Radio}
        title="Live Reactor"
        description="Manage your streaming integration and chat features for"
        serverName={guildName}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <LiveReactorNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isConnected={isConnected}
          isLive={isLive}
        />

        <div className="flex-1 min-w-0">{renderPanel()}</div>
      </div>
    </div>
  );
}
