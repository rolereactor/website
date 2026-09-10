"use client";

import { useState, useEffect, useRef } from "react";
import {
  Cable,
  Unplug,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Gamepad2,
  Clock,
  Eye,
  Link2,
  Shield,
} from "lucide-react";
import {
  TwitchIcon,
  YouTubeIcon,
  KickIcon,
} from "@/components/icons/platform-icons";

import { useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";

import { cn } from "@/lib/utils";
import { useStreamingStore } from "@/store/use-streaming-store";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TwitchModDialog } from "./twitch-mod-dialog";

interface ConnectionPanelProps {
  guildId: string;
}

const PLATFORMS = [
  {
    id: "twitch",
    name: "Twitch",
    icon: TwitchIcon,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: YouTubeIcon,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
  {
    id: "kick",
    name: "Kick",
    icon: KickIcon,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
];

function formatUptime(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime();
  if (ms < 60_000) return "Just started";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function ConnectionPanel({ guildId }: ConnectionPanelProps) {
  const searchParams = useSearchParams();
  const {
    statusCache,
    isLoading,
    isError,
    platforms,
    fetchStatus,
    connect,
    disconnect,
  } = useStreamingStore();

  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(
    null
  );
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<
    string | null
  >(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<
    string | null
  >(null);
  const [showModDialog, setShowModDialog] = useState(false);
  const [verifyingMod, setVerifyingMod] = useState(false);
  const [isModVerified, setIsModVerified] = useState<Record<string, boolean>>({});

  const connections = statusCache[guildId] || [];
  const connectionLoading = isLoading[`status:${guildId}`];
  const connectionError = isError[`status:${guildId}`];

  const isLive = connections.some((c) => c.isConnected && c.isLive);
  const connectedCount = connections.filter((c) => c.isConnected).length;

  const handledToastRef = useRef(false);

  useEffect(() => {
    fetchStatus(guildId);

    if (handledToastRef.current) return;

    const connectedParam = searchParams.get("connected");
    const errorParam = searchParams.get("error");

    if (connectedParam) {
      handledToastRef.current = true;
      toast.success(`Successfully connected ${connectedParam.toUpperCase()}!`, {
        id: `connected-${connectedParam}`,
      });
      fetchStatus(guildId, true);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (errorParam) {
      handledToastRef.current = true;
      toast.error(decodeURIComponent(errorParam), {
        id: `error-${errorParam}`,
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [guildId, fetchStatus, searchParams]);

  const getConnectionForPlatform = (platformId: string) => {
    return (
      connections.find((c) => c.platform?.toLowerCase() === platformId) || null
    );
  };

  const handleConnect = async (platformId: string) => {
    try {
      setConnectingPlatform(platformId);
      const url = await connect(guildId, platformId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(`Failed to connect ${platformId}:`, err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to start the connection flow. Please try again."
      );
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      setDisconnectingPlatform(platformId);
      await disconnect(guildId, platformId);
      setShowDisconnectConfirm(null);
      toast.success(`${platformId.toUpperCase()} disconnected.`);
    } catch (err) {
      console.error(`Failed to disconnect ${platformId}:`, err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to disconnect. Please try again."
      );
    } finally {
      setDisconnectingPlatform(null);
    }
  };

  const handleVerifyMod = async (silent = false) => {
    setVerifyingMod(true);
    try {
      const res = await fetch(
        `/api/stream/${guildId}/verify-mod?username=rolereactor`
      );
      const data = await res.json();
      if (data.success === false) {
        if (!silent) {
          toast.error(data.error || "Failed to verify moderator status");
        }
      } else if (data.isMod) {
        setIsModVerified((prev) => ({ ...prev, twitch: true }));
        if (!silent) {
          toast.success("@rolereactor is now a moderator!");
        }
      } else if (!silent) {
        setShowModDialog(true);
      }
    } catch {
      if (!silent) {
        toast.error("Failed to verify moderator status");
      }
    } finally {
      setVerifyingMod(false);
    }
  };

  // Silent mod check on load so the verified badge survives reloads — the
  // Verify button should only reappear if the bot genuinely lost mod status.
  const bootModCheckRef = useRef<string | null>(null);
  const twitchConnected = connections.some(
    (c) => c.platform?.toLowerCase() === "twitch" && c.isConnected
  );
  useEffect(() => {
    if (!twitchConnected) {
      bootModCheckRef.current = null;
      return;
    }
    if (bootModCheckRef.current === guildId || connectionLoading) return;
    bootModCheckRef.current = guildId;
    handleVerifyMod(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [twitchConnected, connectionLoading, guildId]);

  const overallStatus = connectionError ? (
    <span className="flex items-center gap-2 text-amber-400">
      <AlertTriangle className="size-3.5 shrink-0" />
      <span className="truncate max-w-xs">
        {connectionError.message || "Failed to load connection status."}
      </span>
    </span>
  ) : isLive ? (
    <span className="flex items-center gap-2 text-red-400">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-red-500" />
      </span>
      Live now
    </span>
  ) : connectedCount > 0 ? (
    <span className="flex items-center gap-2 text-emerald-400">
      <span className="size-2 rounded-full bg-emerald-500" />
      {connectedCount} platform{connectedCount > 1 ? "s" : ""} connected
    </span>
  ) : (
    <span className="flex items-center gap-2 text-zinc-500">
      <span className="size-2 rounded-full bg-zinc-600" />
      No platforms connected
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Cable className="size-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Connections</h2>
            <p className="text-xs text-zinc-500">
              Link your streaming platforms and manage alert delivery.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {connectionLoading ? (
            <span className="flex items-center gap-2 text-xs text-zinc-500">
              <Loader2 className="size-3.5 animate-spin" />
              Checking status…
            </span>
          ) : (
            <span className="text-xs font-medium">{overallStatus}</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-zinc-500 hover:text-white"
            onClick={() => fetchStatus(guildId, true)}
            disabled={connectionLoading}
          >
            <RefreshCw
              className={cn("size-3", connectionLoading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Platform list */}
      <Card variant="default" className="rounded-2xl">
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {PLATFORMS.map((platform) => {
              const connection = getConnectionForPlatform(platform.id);
              const isConnected = connection?.isConnected ?? false;
              const isConnecting = connectingPlatform === platform.id;
              const isDisconnecting = disconnectingPlatform === platform.id;
              const showConfirm = showDisconnectConfirm === platform.id;
              const platformIsLive = connection?.isLive ?? false;
              const platformEnabled = platforms[platform.id]?.enabled ?? false;
              const Icon = platform.icon;

              return (
                <div
                  key={platform.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 transition-colors hover:bg-white/[0.02]",
                    !platformEnabled && "opacity-60"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl",
                      platform.bgColor
                    )}
                  >
                    <Icon className={cn("size-5", platform.color)} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {platform.name}
                      </span>
                      {!platformEnabled ? (
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                          Coming soon
                        </span>
                      ) : isConnected ? (
                        <>
                          <span className="flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            {platformIsLive ? "Live" : "Connected"}
                          </span>
                          {platform.id === "twitch" && isModVerified.twitch && (
                            <span
                              title="Bot has moderator permissions"
                              className="flex items-center gap-1 rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400"
                            >
                              <Shield className="size-2.5" />
                              Mod
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                          Not linked
                        </span>
                      )}
                    </div>

                    <div className="mt-1">
                      {!platformEnabled ? (
                        <p className="text-xs text-zinc-500">
                          {platform.name} support is in the works.
                        </p>
                      ) : isConnected && connection ? (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                          <span className="flex items-center gap-1.5 text-zinc-400">
                            <Link2 className="size-3 shrink-0" />
                            <span className="font-medium text-white">
                              {connection.platformLogin || "Unknown channel"}
                            </span>
                          </span>
                          <span className="text-zinc-700">·</span>
                          <span
                            className={cn(
                              "font-medium",
                              connection.alertsEnabled
                                ? "text-emerald-400"
                                : "text-zinc-500"
                            )}
                          >
                            Alerts {connection.alertsEnabled ? "on" : "off"}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500">
                          Link your {platform.name} account to enable stream
                          alerts and chat features.
                        </p>
                      )}
                    </div>

                    {/* Live metadata */}
                    {platformEnabled && platformIsLive && connection && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-zinc-500">
                        {connection.streamTitle && (
                          <span className="truncate max-w-64 font-medium text-white/80">
                            {connection.streamTitle}
                          </span>
                        )}
                        {connection.gameName && (
                          <span className="flex items-center gap-1">
                            <Gamepad2 className="size-3" />
                            <span className="truncate max-w-28">
                              {connection.gameName}
                            </span>
                          </span>
                        )}
                        {connection.viewerCount !== undefined && (
                          <span className="flex items-center gap-1 text-red-400/90">
                            <Eye className="size-3" />
                            {connection.viewerCount.toLocaleString()}
                          </span>
                        )}
                        {connection.startedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatUptime(connection.startedAt)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {platformEnabled && (
                    <div className="shrink-0 flex items-center gap-2 sm:justify-end">
                      {isConnected ? (
                        showConfirm ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-zinc-400 hover:text-white"
                              onClick={() => setShowDisconnectConfirm(null)}
                              disabled={isDisconnecting}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleDisconnect(platform.id)}
                              disabled={isDisconnecting}
                            >
                              {isDisconnecting ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Unplug className="size-3" />
                              )}
                              Unlink
                            </Button>
                          </>
                        ) : (
                          <>
                            {platform.id === "twitch" && !isModVerified.twitch && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Check that the bot is a moderator in your channel"
                                className="h-8 px-2.5 text-xs text-cyan-400 border border-cyan-500/25 bg-cyan-500/10 hover:text-cyan-300 hover:bg-cyan-500/15 hover:border-cyan-500/40"
                                onClick={() => handleVerifyMod()}
                                disabled={verifyingMod}
                              >
                                {verifyingMod ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <Shield className="size-3" />
                                )}
                                Check Mod
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() =>
                                setShowDisconnectConfirm(platform.id)
                              }
                            >
                              <Unplug className="size-3" />
                              Unlink
                            </Button>
                          </>
                        )
                      ) : (
                        <Button
                          variant="cyber"
                          size="sm"
                          className="h-8 px-3.5 text-xs"
                          onClick={() => handleConnect(platform.id)}
                          disabled={isConnecting}
                        >
                          {isConnecting ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Cable className="size-3" />
                          )}
                          Connect
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Twitch Mod Dialog */}
      <TwitchModDialog
        open={showModDialog}
        onOpenChange={setShowModDialog}
        botUsername="rolereactor"
        channelUsername={connections.find((c) => c.platform === "twitch")?.platformLogin || ""}
      />
    </div>
  );
}
