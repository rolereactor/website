"use client";

import { useEffect, useState } from "react";
import { Server, RefreshCw, AlertTriangle } from "lucide-react";
import { ServerTable } from "./_components/server-table";
import { ServerDetailsDialog } from "./_components/server-details-dialog";
import { ResetProEngineDialog } from "./_components/reset-pro-engine-dialog";
import { PageHeader } from "@/app/dashboard/_components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GuildData {
  guildId: string;
  name: string;
  icon: string | null;
  ownerId: string;
  memberCount: number;
  status: "active" | "removed";
  joinedAt: string;
  leftAt: string | null;
}

export default function ServersPage() {
  const [guilds, setGuilds] = useState<GuildData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [selectedGuild, setSelectedGuild] = useState<GuildData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [resetGuild, setResetGuild] = useState<GuildData | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    fetchGuilds();
  }, []);

  const fetchGuilds = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/guilds/history");
      const text = await response.text();
      let data: Record<string, unknown> | null = null;
      try {
        data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          (data?.error as string) || (data?.message as string) || "Failed to fetch guilds"
        );
      }

      setGuilds((data?.data as GuildData[]) || []);
    } catch (err) {
      console.error("Failed to fetch guilds:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectServer = (guild: GuildData) => {
    setSelectedGuild(guild);
    setShowDetails(true);
  };

  const handleResetProEngine = (guild: GuildData) => {
    setResetGuild(guild);
    setShowResetDialog(true);
  };

  const handleResetFromDetails = () => {
    if (selectedGuild) {
      setShowDetails(false);
      setResetGuild(selectedGuild);
      setShowResetDialog(true);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        category="Developer Access"
        categoryIcon={Server}
        title="Server Management"
        description="View and manage all Discord servers the bot is currently installed in."
      />

      <Card variant="cyberpunk" className="border-white/5 bg-zinc-950/40">
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="absolute -inset-2 bg-red-500/20 blur-xl rounded-full animate-pulse" />
                <div className="relative h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_25px_-5px_rgba(239,68,68,0.4)]">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="font-audiowide text-xl font-black text-white uppercase tracking-wider">
                  Server History Unavailable
                </h3>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  {error}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20 mt-2">
                  <span className="text-[10px] text-red-400/70 font-mono uppercase tracking-widest">
                    STATUS:
                  </span>
                  <span className="text-[10px] text-red-400 font-mono font-bold uppercase">
                    {error.replace(/\s+/g, "_")}
                  </span>
                </div>
              </div>

              <Button
                variant="cyber"
                size="lg"
                onClick={fetchGuilds}
                className="h-10 px-6 font-black uppercase tracking-widest text-[11px]"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Retry Uplink
              </Button>
            </div>
          ) : (
            <ServerTable
              guilds={guilds}
              isLoading={isLoading}
              onSelectServer={handleSelectServer}
              onResetProEngine={handleResetProEngine}
            />
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      {selectedGuild && (
        <ServerDetailsDialog
          open={showDetails}
          onOpenChange={setShowDetails}
          guildId={selectedGuild.guildId}
          guildName={selectedGuild.name}
          guildIcon={selectedGuild.icon}
          onResetProEngine={handleResetFromDetails}
        />
      )}

      {/* Reset Dialog */}
      {resetGuild && (
        <ResetProEngineDialog
          open={showResetDialog}
          onOpenChange={setShowResetDialog}
          guildId={resetGuild.guildId}
          guildName={resetGuild.name}
        />
      )}
    </div>
  );
}
