"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface HealthData {
  status: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  database: {
    connected: boolean;
    responseTime: number;
  };
  api: {
    requestsPerMinute: number;
    averageResponseTime: number;
  };
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)}MB`;
}

interface HealthItemProps {
  label: string;
  status: string;
  latency?: string;
  color: "emerald" | "amber" | "red";
}

function HealthItem({ label, status, latency, color }: HealthItemProps) {
  const colors = {
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="flex items-center justify-between p-3 border border-white/5 rounded-xl bg-white/5 group hover:bg-white/10 transition-all">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-black text-zinc-500 tracking-widest">
            {label}
          </span>
          {latency && (
            <span className="text-[9px] text-zinc-600 font-medium uppercase tracking-tighter">
              Lat: {latency}
            </span>
          )}
        </div>
      </div>
      <Badge
        className={cn(
          "text-[9px] font-black tracking-widest h-5 px-2 border-none",
          colors[color as keyof typeof colors]
        )}
      >
        {status}
      </Badge>
    </div>
  );
}

function ActivityIcon() {
  const heights = [14, 8, 18, 10];
  return (
    <div className="flex items-center gap-1 h-4">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-1 bg-cyan-500/50 rounded-full animate-bounce"
          style={{
            animationDelay: `${i * 0.1}s`,
            height: `${h}px`,
          }}
        />
      ))}
    </div>
  );
}

export function SystemHealth() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/proxy/health");
        if (res.ok) {
          const data = await res.json();
          setHealth(data);
          setFetchFailed(false);
        } else {
          setFetchFailed(true);
        }
      } catch (error) {
        console.error("Failed to fetch health:", error);
        setFetchFailed(true);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card
        variant="cyberpunk"
        showGrid
        className="overflow-hidden border-cyan-500/20"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl min-h-12" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (fetchFailed) {
    return (
      <Card
        variant="cyberpunk"
        showGrid
        className="overflow-hidden border-red-500/20"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Infrastructure Health</CardTitle>
              <CardDescription>
                Real-time operational status of core services
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 h-4">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <HealthItem label="DISCORD GATEWAY" status="OFFLINE" color="red" />
          <HealthItem
            label="DATABASE CLUSTER"
            status="UNREACHABLE"
            color="red"
          />
          <HealthItem label="MEMORY USAGE" status="N/A" color="red" />
          <HealthItem label="API LOAD" status="N/A" color="red" />
        </CardContent>
      </Card>
    );
  }

  const discordColor = health?.uptime ? "emerald" : "red";
  const dbColor = health?.database?.connected ? "emerald" : "red";
  const memoryPercent = health?.memory?.percentage ?? 0;
  const memoryColor =
    memoryPercent >= 90 ? "red" : memoryPercent >= 70 ? "amber" : "emerald";

  return (
    <Card
      variant="cyberpunk"
      showGrid
      className="overflow-hidden border-cyan-500/20"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Infrastructure Health</CardTitle>
            <CardDescription>
              Real-time operational status of core services
            </CardDescription>
          </div>
          <ActivityIcon />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <HealthItem
          label="DISCORD GATEWAY"
          status={health?.uptime ? "ONLINE" : "OFFLINE"}
          latency={health?.uptime ? formatUptime(health.uptime) : "N/A"}
          color={discordColor}
        />
        <HealthItem
          label="DATABASE CLUSTER"
          status={health?.database?.connected ? "STABLE" : "DOWN"}
          latency={
            health?.database?.responseTime
              ? `${health.database.responseTime}ms`
              : "N/A"
          }
          color={dbColor}
        />
        <HealthItem
          label="MEMORY USAGE"
          status={`${health?.memory?.percentage?.toFixed(0) || 0}%`}
          latency={health?.memory ? formatBytes(health.memory.used) : "N/A"}
          color={memoryColor}
        />
        <HealthItem
          label="API LOAD"
          status={
            health?.api?.requestsPerMinute
              ? `${health.api.requestsPerMinute}/min`
              : "NORMAL"
          }
          latency={
            health?.api?.averageResponseTime
              ? `${health.api.averageResponseTime}ms`
              : "N/A"
          }
          color="emerald"
        />
      </CardContent>
    </Card>
  );
}
