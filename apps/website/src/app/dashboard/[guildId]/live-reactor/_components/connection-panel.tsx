"use client";

import { useState, useEffect, useRef } from "react";
import {
  Cable,
  Unplug,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Radio,
  Tv,
  Gamepad2,
  Clock,
  Eye,
  Users,
} from "lucide-react";

import { useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";

import { cn } from "@/lib/utils";
import { useStreamingStore } from "@/store/use-streaming-store";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ConnectionPanelProps {
  guildId: string;
}

const PLATFORMS = [
  {
    id: "twitch",
    name: "Twitch",
    icon: Tv,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    accentColor: "rgba(168,85,247,0.08)",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Radio,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    accentColor: "rgba(239,68,68,0.06)",
    comingSoon: true,
  },
  {
    id: "kick",
    name: "Kick",
    icon: Gamepad2,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    accentColor: "rgba(34,197,94,0.06)",
    comingSoon: true,
  },
];

function formatUptime(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime();
  if (ms < 0) return "Just started";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return "Just started";
}

export function ConnectionPanel({ guildId }: ConnectionPanelProps) {
  const searchParams = useSearchParams();
  const { statusCache, isLoading, isError, fetchStatus, connect, disconnect } =
    useStreamingStore();

  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(
    null
  );
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<
    string | null
  >(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<
    string | null
  >(null);

  const connections = statusCache[guildId] || [];
  const connectionLoading = isLoading[`status:${guildId}`];
  const connectionError = isError[`status:${guildId}`];

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
      const url = await connect(guildId);
      window.open(url, "_blank");
    } catch (err) {
      console.error(`Failed to connect ${platformId}:`, err);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      setDisconnectingPlatform(platformId);
      await disconnect(guildId);
      setShowDisconnectConfirm(null);
    } catch (err) {
      console.error(`Failed to disconnect ${platformId}:`, err);
    } finally {
      setDisconnectingPlatform(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {connectionLoading ? (
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Checking connection status…</span>
            </div>
          ) : connectionError ? (
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-xs">
                {connectionError.message || "Failed to load connection status."}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Platform connections</span>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-zinc-500 hover:text-white"
          onClick={() => fetchStatus(guildId, true)}
          disabled={connectionLoading}
        >
          <RefreshCw
            className={cn("w-3 h-3 mr-1", connectionLoading && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* Platform Card List */}
      <div className="flex flex-col gap-3">
        {PLATFORMS.map((platform) => {
          const connection = getConnectionForPlatform(platform.id);
          const isConnected = connection?.isConnected ?? false;
          const isConnecting = connectingPlatform === platform.id;
          const isDisconnecting = disconnectingPlatform === platform.id;
          const showConfirm = showDisconnectConfirm === platform.id;
          const Icon = platform.icon;

          const isLive = connection?.isLive ?? false;

          return (
            <Card
              key={platform.id}
              variant="cyberpunk"
              showGrid
              className={cn(
                "transition-all duration-200",
                isConnected && !isLive && platform.borderColor,
                isConnected && isLive && "border-red-500/40 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]",
                platform.comingSoon && "opacity-70"
              )}
            >
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  {/* Platform Icon */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-xl shrink-0",
                      platform.bgColor
                    )}
                  >
                    <Icon className={cn("w-5 h-5", platform.color)} />
                  </div>

                  {/* Platform Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white">
                        {platform.name}
                      </span>
                      {platform.comingSoon ? (
                        <Badge variant="secondary" className="text-[10px] h-4">
                          <Clock className="w-2.5 h-2.5 mr-1" />
                          Coming Soon
                        </Badge>
                      ) : isConnected ? (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="success" className="text-[10px] h-4">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                            Connected
                          </Badge>
                          {isLive && (
                            <Badge className="text-[10px] h-4 bg-red-500/20 text-red-400 border border-red-500/30 gap-1">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                              </span>
                              LIVE
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="destructive" className="text-[10px] h-4">
                          <XCircle className="w-2.5 h-2.5 mr-1" />
                          Disconnected
                        </Badge>
                      )}
                    </div>

                    {/* Sub-info */}
                    {platform.comingSoon ? (
                      <p className="text-xs text-zinc-500">
                        {platform.name} support coming soon. Stay tuned!
                      </p>
                    ) : isConnected && connection ? (
                      <div className="flex flex-col gap-1">
                        {/* Channel row */}
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span>
                            Channel:{" "}
                            <span className="text-white font-medium">
                              {connection.platformLogin || "Unknown"}
                            </span>
                          </span>
                          <span className="text-zinc-600">·</span>
                          <span>
                            Alerts:{" "}
                            <span
                              className={cn(
                                "font-medium",
                                connection.alertsEnabled
                                  ? "text-emerald-400"
                                  : "text-zinc-500"
                              )}
                            >
                              {connection.alertsEnabled ? "On" : "Off"}
                            </span>
                          </span>
                        </div>

                        {/* Live stream metadata */}
                        {isLive && (
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            {connection.streamTitle && (
                              <p className="text-xs text-white/80 font-medium truncate max-w-xs">
                                {connection.streamTitle}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                              {connection.gameName && (
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {connection.gameName}
                                </span>
                              )}
                              {connection.viewerCount !== undefined && (
                                <span className="flex items-center gap-1 text-red-400/80">
                                  <Users className="w-3 h-3" />
                                  {connection.viewerCount.toLocaleString()}
                                </span>
                              )}
                              {connection.startedAt && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatUptime(connection.startedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">
                        Not connected — click Connect to authorize
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {!platform.comingSoon && (
                    <div className="shrink-0">
                      {isConnected ? (
                        <div className="flex items-center gap-2">
                          {!showConfirm ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() =>
                                setShowDisconnectConfirm(platform.id)
                              }
                            >
                              <Unplug className="w-3 h-3 mr-1.5" />
                              Disconnect
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => handleDisconnect(platform.id)}
                                disabled={isDisconnecting}
                              >
                                {isDisconnecting ? (
                                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                                ) : (
                                  <Unplug className="w-3 h-3 mr-1.5" />
                                )}
                                Confirm
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => setShowDisconnectConfirm(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      ) : (
                        <Button
                          variant="cyber"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleConnect(platform.id)}
                          disabled={isConnecting}
                        >
                          {isConnecting ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                          ) : (
                            <Cable className="w-3 h-3 mr-1.5" />
                          )}
                          Connect
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
