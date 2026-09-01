"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid,
  RefreshCcw,
  Loader2,
  CheckCircle2,
  XCircle,
  Bot,
  Radio,
  Clock,
  MessageSquare,
  Terminal,
  Wifi,
} from "lucide-react";

import { useStreamingStore } from "@/store/use-streaming-store";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface DiagnosticsPanelProps {
  guildId: string;
}

function formatTimestamp(ts: number | null): string {
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleString();
}

export function DiagnosticsPanel({ guildId }: DiagnosticsPanelProps) {
  const { diagCache, isLoading, fetchDiag } = useStreamingStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const diag = diagCache[guildId];
  const diagLoading = isLoading[`diag:${guildId}`];

  useEffect(() => {
    fetchDiag(guildId);
  }, [guildId, fetchDiag]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchDiag(guildId, true);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (diagLoading && !diag) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="cyberpunk" showGrid>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          <Card variant="cyberpunk" showGrid>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
        <Card variant="cyberpunk" showGrid>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!diag) {
    return (
      <Card variant="cyberpunk" showGrid>
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-4">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <p className="text-sm text-zinc-400 font-medium">No diagnostic data available.</p>
          <Button
            variant="cyber"
            className="mt-4"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
            Fetch Diagnostics
          </Button>
        </CardContent>
      </Card>
    );
  }

  const connections = diag.connections ?? [];
  const eventSub = diag.eventSub ?? { sessions: 0, ready: 0 };
  const botAccount = diag.botAccount ?? { connected: false };

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 font-mono">
          Last refreshed: {formatTimestamp(Date.now())}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCcw className="w-3.5 h-3.5" />
          )}
          Refresh
        </Button>
      </div>

      {/* Connection Health */}
      <Card variant="cyberpunk" showGrid>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10">
              <Wifi className="w-4 h-4 text-cyan-400" />
            </div>
            Connection Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <p className="text-sm text-zinc-500">No connections found.</p>
          ) : (
            <div className="space-y-3">
              {connections.map((conn, idx) => (
                <div
                  key={`${conn.platform}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20"
                >
                  <div className="flex items-center gap-3">
                    {conn.isConnected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm text-white font-medium">
                        {conn.platform || "Twitch"} —{" "}
                        {conn.platformLogin || "Unknown"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {conn.isConnected ? "Connected" : "Disconnected"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={conn.eventSubConnected ? "success" : "secondary"}
                      className="text-[10px]"
                    >
                      EventSub: {conn.eventSubConnected ? "Active" : "Inactive"}
                    </Badge>
                    <Badge
                      variant={conn.alertsEnabled ? "accent" : "secondary"}
                      className="text-[10px]"
                    >
                      Alerts: {conn.alertsEnabled ? "On" : "Off"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* EventSub & Bot Account */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EventSub Session */}
        <Card variant="cyberpunk" showGrid>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10">
                <Radio className="w-4 h-4 text-purple-400" />
              </div>
              EventSub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">Sessions</p>
                <p className="text-2xl font-bold text-white font-mono">
                  {eventSub.sessions}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">Ready</p>
                <p className="text-2xl font-bold text-emerald-400 font-mono">
                  {eventSub.ready}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bot Account */}
        <Card variant="cyberpunk" showGrid>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              Bot Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Status</span>
              <Badge
                variant={botAccount.connected ? "success" : "destructive"}
                className="text-[10px]"
              >
                {botAccount.connected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            {botAccount.login && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Login</span>
                <span className="text-sm text-white font-mono">
                  {botAccount.login}
                </span>
              </div>
            )}
            {botAccount.source && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Source</span>
                <span className="text-sm text-white font-mono">
                  {botAccount.source}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timestamps */}
      <Card variant="cyberpunk" showGrid>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10">
              <Clock className="w-4 h-4 text-yellow-400" />
            </div>
            Activity Timestamps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-black/20">
              <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500">Last Chat</p>
                <p className="text-sm text-white font-mono truncate">
                  {formatTimestamp(diag.lastChatAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-black/20">
              <Terminal className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500">Last Command Reply</p>
                <p className="text-sm text-white font-mono truncate">
                  {formatTimestamp(diag.lastCommandReplyAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
