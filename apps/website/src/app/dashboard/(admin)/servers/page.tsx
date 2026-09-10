"use client";

import { useEffect, useState } from "react";
import { Server, AlertTriangle } from "lucide-react";
import { ServerTable } from "./_components/server-table";
import { ServerDetailsDialog } from "./_components/server-details-dialog";
import { ResetProEngineDialog } from "./_components/reset-pro-engine-dialog";
import { PageHeader } from "@/app/dashboard/_components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatePanel } from "@/components/common/state-panel";

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

      {error ? (
        <StatePanel
          variant="error"
          icon={AlertTriangle}
          title="Server History Unavailable"
          description={error}
          actionLabel="Retry Uplink"
          onAction={fetchGuilds}
        />
      ) : (
        <Card variant="cyberpunk" className="border-white/5 bg-zinc-950/40">
          <CardContent className="p-0">
            <ServerTable
              guilds={guilds}
              isLoading={isLoading}
              onSelectServer={handleSelectServer}
              onResetProEngine={handleResetProEngine}
            />
          </CardContent>
        </Card>
      )}

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
