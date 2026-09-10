"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Settings,
  Save,
  Loader2,
  Hash,
  Bell,
  Terminal,
  UserMinus,
  UserPlus,
  Gift,
  Swords,
  RotateCcw,
  AlertTriangle,
  Megaphone,
  DollarSign,
  Sticker,
  Lock,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import {
  useStreamingStore,
  type StreamConfig,
} from "@/store/use-streaming-store";
import {
  PLATFORM_REGISTRY,
  type PlatformAlertType,
} from "@/lib/platform-registry";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TwitchIcon,
  YouTubeIcon,
  KickIcon,
} from "@/components/icons/platform-icons";

interface ConfigPanelProps {
  guildId: string;
  connections?: Array<{ platform: string; isConnected: boolean }>;
}

const ALERT_ICON_MAP: Record<string, { icon: React.ElementType; color: string }> = {
  goLive: { icon: Megaphone, color: "text-cyan-400" },
  offline: { icon: UserMinus, color: "text-red-400" },
  follow: { icon: UserPlus, color: "text-purple-400" },
  subscribe: { icon: Bell, color: "text-emerald-400" },
  giftSub: { icon: Gift, color: "text-yellow-400" },
  raid: { icon: Swords, color: "text-fuchsia-400" },
  resub: { icon: RotateCcw, color: "text-blue-400" },
  superChat: { icon: DollarSign, color: "text-yellow-400" },
  superSticker: { icon: Sticker, color: "text-pink-400" },
};

export function ConfigPanel({ guildId, connections = [] }: ConfigPanelProps) {
  const { configCache, isLoading, fetchConfig, updateConfig } =
    useStreamingStore();
  const [isSaving, setIsSaving] = useState(false);
  const [localConfig, setLocalConfig] = useState<StreamConfig>({
    alertsEnabled: false,
    alertChannelId: null,
    commandsEnabled: false,
    commandPrefix: "!",
    alertTypes: {
      goLive: false,
      offline: false,
      follow: false,
      subscribe: false,
      giftSub: false,
      raid: false,
      resub: false,
    },
  });

  const config = configCache[guildId];
  const configLoading = isLoading[`config:${guildId}`];

  const connectedPlatforms = useMemo(() => {
    return connections
      .filter((c) => c.isConnected)
      .map((c) => PLATFORM_REGISTRY[c.platform])
      .filter(Boolean);
  }, [connections]);

  const availableAlertTypes = useMemo(() => {
    const seen = new Set<string>();
    const alerts: Array<PlatformAlertType & { icon: React.ElementType; color: string }> = [];

    for (const platform of connectedPlatforms) {
      for (const alert of platform.features.alerts) {
        if (!seen.has(alert.id)) {
          seen.add(alert.id);
          const iconConfig = ALERT_ICON_MAP[alert.id] || { icon: Bell, color: "text-zinc-400" };
          alerts.push({ ...alert, ...iconConfig });
        }
      }
    }

    return alerts;
  }, [connectedPlatforms]);

  const isFeatureAvailable = useMemo(() => {
    return (feature: string): boolean => {
      for (const platform of connectedPlatforms) {
        const f = platform.features[feature as keyof typeof platform.features];
        if (f && !Array.isArray(f) && f.available) return true;
      }
      return false;
    };
  }, [connectedPlatforms]);

  useEffect(() => {
    fetchConfig(guildId);
  }, [guildId, fetchConfig]);

  useEffect(() => {
    if (config) {
      setLocalConfig({ ...config });
    }
  }, [config]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateConfig(guildId, localConfig);
      toast.success("Stream configuration saved successfully!");
    } catch (err) {
      console.error("Failed to save config:", err);
      toast.error("Failed to save configuration. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (configLoading && !config) {
    return (
      <div className="space-y-6">
        <Card variant="cyberpunk" showGrid>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          </CardContent>
        </Card>
        <Card variant="cyberpunk" showGrid>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card variant="cyberpunk" showGrid>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10">
              <Settings className="w-4 h-4 text-cyan-400" />
            </div>
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Alert Channel ID */}
          <div className="space-y-2">
            <Label variant="cyber" className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5" />
              Alert Channel ID
            </Label>
            <Input
              variant="cyber"
              placeholder="e.g. 1234567890123456789"
              value={localConfig.alertChannelId || ""}
              onChange={(e) =>
                setLocalConfig((prev) => ({
                  ...prev,
                  alertChannelId: e.target.value || null,
                }))
              }
              maxLength={20}
            />
            <p className="text-xs text-zinc-500">
              Discord channel ID where stream alerts will be posted.
            </p>
          </div>

          <Separator className="bg-white/5" />

          {/* Toggle Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between sm:justify-start sm:space-x-4 p-3 rounded-lg border border-white/5 bg-black/20">
              <div className="space-y-1">
                <Label variant="cyber" className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5" />
                  Alerts Enabled
                </Label>
                <p className="text-xs text-zinc-500">
                  Post alerts to your Discord channel.
                </p>
              </div>
              <Switch
                variant="cyan"
                checked={localConfig.alertsEnabled}
                onCheckedChange={(checked) =>
                  setLocalConfig((prev) => ({
                    ...prev,
                    alertsEnabled: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between sm:justify-start sm:space-x-4 p-3 rounded-lg border border-white/5 bg-black/20">
              <div className="space-y-1">
                <Label variant="cyber" className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" />
                  Commands Enabled
                  {!isFeatureAvailable("commands") && (
                    <span className="text-[10px] text-zinc-500 font-normal">(Twitch only)</span>
                  )}
                </Label>
                <p className="text-xs text-zinc-500">
                  Allow chat commands in your stream channel.
                </p>
              </div>
              <Switch
                variant="cyan"
                checked={localConfig.commandsEnabled}
                onCheckedChange={(checked) =>
                  setLocalConfig((prev) => ({
                    ...prev,
                    commandsEnabled: checked,
                  }))
                }
                disabled={!isFeatureAvailable("commands")}
              />
            </div>
          </div>

          {/* Command Prefix */}
          <div className="space-y-2 max-w-50">
            <Label variant="cyber" className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              Command Prefix
              {!isFeatureAvailable("commands") && (
                <span className="text-[10px] text-zinc-500 font-normal">(Twitch only)</span>
              )}
            </Label>
            <Input
              variant="cyber"
              placeholder="!"
              value={localConfig.commandPrefix}
              onChange={(e) =>
                setLocalConfig((prev) => ({
                  ...prev,
                  commandPrefix: e.target.value.charAt(0) || "!",
                }))
              }
              maxLength={1}
              className="w-16 text-center text-lg"
              disabled={!isFeatureAvailable("commands")}
            />
            <p className="text-xs text-zinc-500">
              Single character used to trigger commands.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card variant="cyberpunk" showGrid>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
              <Bell className="w-4 h-4 text-emerald-400" />
            </div>
            Alert Types
            {connectedPlatforms.length > 0 && (
              <div className="flex items-center gap-1.5 ml-auto">
                {connectedPlatforms.map((p) => {
                  const Icon = p.id === "twitch" ? TwitchIcon : p.id === "youtube" ? YouTubeIcon : KickIcon;
                  return (
                    <span
                      key={p.id}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400"
                    >
                      <Icon className="w-3 h-3 inline mr-1" />
                      {p.name}
                    </span>
                  );
                })}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableAlertTypes.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-white/5 bg-black/20 text-zinc-500 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Connect a platform to configure alert types.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAlertTypes.map(({ id, label, description, available, icon: Icon, color }) => (
                <div
                  key={id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20 transition-all",
                    available && localConfig.alertTypes[id] &&
                      "border-cyan-500/20 bg-cyan-500/5",
                    !available && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-4 h-4", available ? color : "text-zinc-600")} />
                    <div>
                      <span className="text-sm text-white font-medium">
                        {label}
                      </span>
                      {description && (
                        <p className="text-[10px] text-zinc-500 mt-0.5">{description}</p>
                      )}
                    </div>
                  </div>
                  {available ? (
                    <Switch
                      variant="cyan"
                      checked={localConfig.alertTypes[id] ?? false}
                      onCheckedChange={(checked) =>
                        setLocalConfig((prev) => ({
                          ...prev,
                          alertTypes: { ...prev.alertTypes, [id]: checked },
                        }))
                      }
                    />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-zinc-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="cyber"
          size="lg"
          className="h-10 px-4 sm:px-6 font-black uppercase tracking-widest text-[11px] w-full sm:w-auto"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="mr-2 h-3.5 w-3.5" />
          )}
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
