"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import {
  RefreshCw,
  Terminal,
  Shield,
  Check,
  X,
  Database,
  Zap,
  Cpu,
  Activity,
  Lock,
  Wallet,
  Server,
} from "lucide-react";
import { ErrorView } from "@/components/common/error-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { BotConfig, BotConfigSchema } from "@/types/settings";

const renderValue = (value: unknown): React.ReactNode => {
  if (value === null || value === undefined)
    return <span className="text-zinc-600">null</span>;
  if (typeof value === "boolean") {
    return value ? (
      <span className="text-green-500 flex items-center gap-1">
        <Check className="size-3" /> Enabled
      </span>
    ) : (
      <span className="text-red-500 flex items-center gap-1">
        <X className="size-3" /> Disabled
      </span>
    );
  }
  if (typeof value === "string") {
    if (value === "********")
      return (
        <span className="text-zinc-600 italic tracking-widest">••••••••</span>
      );
    return <span className="text-cyan-400">"{value}"</span>;
  }
  if (typeof value === "number")
    return <span className="text-amber-400">{value}</span>;
  if (Array.isArray(value))
    return <span className="text-zinc-400">Array({value.length})</span>;
  if (typeof value === "object")
    return <span className="text-zinc-400">Object</span>;
  return <span className="text-zinc-400">{String(value)}</span>;
};

interface ConfigSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  data: Record<string, unknown>;
}

const ConfigSection = ({ title, icon: Icon, data }: ConfigSectionProps) => {
  if (!data) return null;

  return (
    <Card className="border-white/5 bg-zinc-900/30 overflow-hidden mb-4">
      <CardHeader className="py-3 bg-white/5 border-b border-white/5">
        <CardTitle className="text-sm font-mono uppercase tracking-widest flex items-center gap-2">
          <Icon className="size-4 text-cyan-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/5">
          {Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
            >
              <span className="text-xs font-mono text-zinc-400">{key}</span>
              <div className="text-xs font-mono text-zinc-200 truncate max-w-50 md:max-w-md">
                {renderValue(value)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export function ConfigViewer() {
  const [data, setData] = useState<BotConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, startTransition] = useTransition();

  const fetchConfig = useCallback(() => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/proxy/config");
        if (!res.ok) throw new Error("Failed to fetch configuration");
        const json = await res.json();

        // The API returns { status, config, environment, isProduction }
        const result = BotConfigSchema.safeParse(json);

        if (result.success) {
          setData(result.data);
        } else {
          console.error("Config validation failure:", result.error.format());
          throw new Error("Invalid response format from config API");
        }
        setError(null);
      } catch (err: unknown) {
        console.error("Config fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load configuration"
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  if (error) {
    return (
      <ErrorView
        title="Access Failed"
        message={error}
        onRetry={fetchConfig}
        showHome={false}
      />
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="size-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const { config } = data ?? {};

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-white/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Environment
              </p>
              <p className="text-lg font-bold text-white uppercase">
                {data?.environment}
              </p>
            </div>
            <Server className="size-8 text-zinc-700" />
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-white/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Mode
              </p>
              <p
                className={cn(
                  "text-lg font-bold uppercase",
                  data.isProduction ? "text-green-500" : "text-amber-500"
                )}
              >
                {data.isProduction ? "Production" : "Development"}
              </p>
            </div>
            <Activity className="size-8 text-zinc-700" />
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-white/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Bot Name
              </p>
              <p className="text-lg font-bold text-white truncate max-w-37.5">
                {config?.botInfo?.name ?? "Role Reactor"}
              </p>
            </div>
            <Terminal className="size-8 text-zinc-700" />
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-white/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                API Prefix
              </p>
              <p className="text-lg font-bold text-white">/api/v1</p>
            </div>
            <Database className="size-8 text-zinc-700" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-zinc-900/50 border border-white/5">
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="limits">Limits</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConfig}
            disabled={isRefreshing}
            className="bg-zinc-900/50 border-white/5 hover:bg-zinc-800"
          >
            <RefreshCw
              className={cn("size-3 mr-2", isRefreshing && "animate-spin")}
            />
            Refresh
          </Button>
        </div>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config?.discord && (
              <ConfigSection
                title="Discord Configuration"
                icon={Terminal}
                data={config.discord as Record<string, unknown>}
              />
            )}
            {config?.database && (
              <ConfigSection
                title="Database Settings"
                icon={Database}
                data={config.database as Record<string, unknown>}
              />
            )}
            {config?.logging && (
              <ConfigSection
                title="Logging Configuration"
                icon={Activity}
                data={config.logging as Record<string, unknown>}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config?.features && (
              <ConfigSection
                title="Feature Flags"
                icon={Zap}
                data={config.features as Record<string, unknown>}
              />
            )}
            {config?.aiSettings && (
              <ConfigSection
                title="AI Settings"
                icon={Cpu}
                data={config.aiSettings as Record<string, unknown>}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(config?.rateLimits as any)?.rest && (
              <ConfigSection
                title="REST Rate Limits"
                icon={Shield}
                data={(config?.rateLimits as any)?.rest}
              />
            )}
            {config?.cacheLimits && (
              <ConfigSection
                title="Cache Limits"
                icon={Database}
                data={config.cacheLimits as Record<string, unknown>}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config?.payments && (
              <>
                <ConfigSection
                  title="Plisio (Crypto)"
                  icon={Lock}
                  data={
                    ((config.payments as any).plisio || {}) as Record<
                      string,
                      unknown
                    >
                  }
                />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
