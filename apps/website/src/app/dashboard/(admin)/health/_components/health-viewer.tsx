"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Cpu,
  HardDrive,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Server,
  Database,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { NodeLoader } from "@/components/common/node-loader";
import { ErrorView } from "@/components/common/error-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HealthData {
  uptime: number;
  memory: { used: number; total: number; percentage: number };
  cpu: { usage: number };
  database: { connected: boolean; responseTime: number };
  api: { requestsPerMinute: number; averageResponseTime: number };
  environment: string;
  isProduction: boolean;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / 1024 ** 2;
  return `${mb.toFixed(2)} MB`;
}

export function SystemHealthViewer() {
  const [data, setData] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/proxy/health");

      // Debug: Log response status
      if (!res.ok) {
        console.error(`[Health] API returned ${res.status}`);
        throw new Error(`Bot API returned ${res.status}`);
      }

      const json = await res.json();

      // Debug: Log actual response structure
      console.log("[Health] Raw response:", json);

      // Handle both response formats: { data: {...} } or {...}
      const healthData = json.data || json;

      // Debug: Log extracted health data
      console.log("[Health] Extracted data:", healthData);

      if (!healthData.uptime && !healthData.memory) {
        console.error("[Health] Empty data received:", healthData);
        throw new Error("Bot API returned empty health data");
      }

      setData({
        uptime: healthData.uptime ?? 0,
        memory: healthData.memory ?? { used: 0, total: 0, percentage: 0 },
        cpu: healthData.cpu ?? { usage: 0 },
        database: healthData.database ?? { connected: false, responseTime: 0 },
        api: healthData.api ?? { requestsPerMinute: 0, averageResponseTime: 0 },
        environment: healthData.environment ?? "UNKNOWN",
        isProduction: healthData.isProduction ?? false,
      });
      setError(null);
    } catch (err: unknown) {
      console.error("Health fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load health data"
      );
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  if (error && !data) {
    return (
      <ErrorView
        title="Connection Failed"
        message={error}
        onRetry={fetchHealth}
        showHome={false}
      />
    );
  }

  if (!data) {
    return <NodeLoader title="Loading Health" subtitle="Fetching metrics..." />;
  }

  const memoryPercentage = data.memory.percentage;
  const systemStatus =
    memoryPercentage >= 90
      ? "CRITICAL"
      : memoryPercentage >= 80
        ? "WARNING"
        : "HEALTHY";
  const statusColor =
    memoryPercentage >= 90
      ? "text-red-500"
      : memoryPercentage >= 80
        ? "text-amber-500"
        : "text-green-500";
  const StatusIcon = memoryPercentage >= 80 ? AlertTriangle : CheckCircle;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold font-mono uppercase tracking-tight text-white">
            System Health
          </h2>
          <p className="text-zinc-500 text-xs font-mono mt-1">
            Real-time system performance and resource utilization
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchHealth}
          disabled={isRefreshing}
          className={cn(
            "h-8 bg-zinc-900/50 border-white/10 hover:bg-zinc-800 text-xs font-mono uppercase tracking-wider",
            isRefreshing && "animate-pulse border-cyan-500/50 text-cyan-500"
          )}
        >
          <RefreshCw
            className={cn("size-3 mr-2", isRefreshing && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-white/5 bg-zinc-950/40 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                System Status
              </p>
              <StatusIcon className={cn("size-4", statusColor)} />
            </div>
            <p
              className={cn(
                "text-2xl font-bold uppercase font-mono tracking-tight",
                statusColor
              )}
            >
              {systemStatus}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-zinc-950/40 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                Uptime
              </p>
              <Clock className="size-4 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-white tracking-tight">
              {formatUptime(data.uptime)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-zinc-950/40 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                Environment
              </p>
              <Server className="size-4 text-purple-500" />
            </div>
            <p
              className={cn(
                "text-2xl font-bold uppercase font-mono tracking-tight",
                data.isProduction ? "text-green-500" : "text-amber-500"
              )}
            >
              {data.environment}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-zinc-950/40 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                Database
              </p>
              <Database
                className={cn(
                  "size-4",
                  data.database.connected ? "text-green-500" : "text-red-500"
                )}
              />
            </div>
            <p
              className={cn(
                "text-2xl font-bold uppercase font-mono tracking-tight",
                data.database.connected ? "text-green-500" : "text-red-500"
              )}
            >
              {data.database.connected ? "Connected" : "Offline"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-white/5 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2 text-zinc-300">
              <HardDrive className="size-4 text-cyan-500" /> Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-500 text-xs font-mono uppercase">
                  Used
                </span>
                <span className="text-white font-mono text-sm">
                  {formatBytes(data.memory.used)} /{" "}
                  {formatBytes(data.memory.total)}
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    memoryPercentage < 60
                      ? "bg-green-500"
                      : memoryPercentage < 80
                        ? "bg-amber-500"
                        : "bg-red-500"
                  )}
                  style={{ width: `${memoryPercentage}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 font-mono text-right">
                {memoryPercentage.toFixed(1)}% utilized
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2 text-zinc-300">
              <Cpu className="size-4 text-cyan-500" /> CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-500 text-xs font-mono uppercase">
                  Current Load
                </span>
                <span className="text-white font-mono text-sm">
                  {data.cpu.usage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    data.cpu.usage < 60
                      ? "bg-green-500"
                      : data.cpu.usage < 80
                        ? "bg-amber-500"
                        : "bg-red-500"
                  )}
                  style={{ width: `${data.cpu.usage}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 font-mono text-right">
                {data.cpu.usage < 60
                  ? "Normal"
                  : data.cpu.usage < 80
                    ? "Elevated"
                    : "High"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2 text-zinc-300">
              <Zap className="size-4 text-cyan-500" /> API Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-xs font-mono uppercase">
                  Requests/min
                </span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-3 text-green-500" />
                  <span className="text-white font-mono text-base font-bold">
                    {data.api.requestsPerMinute}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-xs font-mono uppercase">
                  Avg Response
                </span>
                <span className="text-white font-mono text-base font-bold">
                  {data.api.averageResponseTime}ms
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2 text-zinc-300">
              <Database className="size-4 text-cyan-500" /> Database Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-xs font-mono uppercase">
                  Status
                </span>
                <span
                  className={cn(
                    "font-mono uppercase text-sm font-bold",
                    data.database.connected ? "text-green-500" : "text-red-500"
                  )}
                >
                  {data.database.connected ? "Online" : "Offline"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-xs font-mono uppercase">
                  Ping
                </span>
                <span className="text-white font-mono text-base font-bold">
                  {data.database.responseTime}ms
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
