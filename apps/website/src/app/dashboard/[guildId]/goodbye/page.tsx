"use client";

import { useState, use, useEffect, useRef } from "react";
import { Audiowide } from "next/font/google";
import {
  DoorOpen,
  Settings as SettingsIcon,
  Save,
  Loader2,
  Send,
  AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useGoodbyeStore } from "@/store/use-goodbye-store";
import { useServerStore } from "@/store/use-server-store";
import { useProEngineStore } from "@/store/use-pro-engine-store";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/app/dashboard/_components/page-header";
import { StatePanel } from "@/components/common/state-panel";
import { Button } from "@/components/ui/button";

import { NodeLoader } from "@/components/common/node-loader";
import { GoodbyeSettingsTab } from "./_components/settings";
import { toast } from "@/lib/toast";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface GoodbyePageProps {
  params: Promise<{ guildId: string }>;
}

export default function GoodbyePage({ params }: GoodbyePageProps) {
  const { guildId } = use(params);
  const [activeTab, setActiveTab] = useState("settings");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const settingsRef = useRef<{
    handleSave: () => Promise<void>;
    saving: boolean;
  }>(null);

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(`/api/guilds/${guildId}/goodbye/test`, {
        method: "POST",
      });
      const text = await response.text();
      let data: Record<string, unknown> | null = null;
      try {
        data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
      } catch {
        data = null;
      }
      if (data && data.status === "success") {
        toast.success("Test message sent to the goodbye channel!");
      } else {
        toast.error(
          (data?.message as string) || (data?.error as string) || "Failed to send test message"
        );
      }
    } catch {
      toast.error("Failed to send test message");
    } finally {
      setIsTesting(false);
    }
  };

  const { getGuildData, fetchGoodbyeData } = useGoodbyeStore();

  const hasGuildData = guildId in useGoodbyeStore.getState().dataCache;
  const guildData = getGuildData(guildId);
  const { settings, isLoading, isError } = guildData;

  const { guilds } = useServerStore();
  const { fetchSettings } = useProEngineStore();

  const activeGuild = guilds.find((g) => g.id === guildId);
  const guildName = activeGuild?.name || "this server";

  useEffect(() => {
    if (guildId) {
      fetchGoodbyeData(guildId);
      fetchSettings(guildId);
    }
  }, [guildId, fetchGoodbyeData, fetchSettings]);

  const isInitialLoading = !hasGuildData || (isLoading && !settings);

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

  if (isError && !settings) {
    const isBotOffline =
      isError.message?.includes("unavailable") ||
      isError.message?.includes("503");

    return (
      <div className="space-y-6 w-full">
        <PageHeader
          category="Engagement Management"
          categoryIcon={DoorOpen}
          title="Goodbye System"
          description="Configure automatic goodbye messages for departing members in"
          serverName={guildName}
        />
        <StatePanel
          variant="error"
          icon={AlertTriangle}
          title={isBotOffline ? "Bot Service Offline" : "System Alert"}
          description={
            isBotOffline
              ? "The bot service is currently unavailable. Please ensure the bot is running and try again."
              : isError.message || "Failed to load goodbye data."
          }
          actionLabel="Try Again"
          onAction={() => fetchGoodbyeData(guildId, true)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        category="Engagement Management"
        categoryIcon={DoorOpen}
        title="Goodbye System"
        description="Configure automatic goodbye messages for departing members in"
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
              value="settings"
              variant="neon"
              className={cn(
                "flex-1 lg:flex-none gap-2 min-w-0",
                audiowide.className
              )}
            >
              <SettingsIcon className="w-4 h-4" />
              <span className="truncate">Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 w-full sm:w-auto lg:justify-self-end">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-10 px-4 font-black uppercase tracking-widest text-[11px] border-zinc-700 hover:border-cyan-500/50 hover:bg-cyan-500/5"
              onClick={handleTest}
              disabled={isTesting}
            >
              {isTesting ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="mr-2 h-3.5 w-3.5" />
              )}
              Test
            </Button>
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
        </div>

        <TabsContent
          value="settings"
          className="mt-0 focus-visible:outline-none"
        >
          <GoodbyeSettingsTab
            ref={settingsRef}
            guildId={guildId}
            onSavingChange={setIsSaving}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
