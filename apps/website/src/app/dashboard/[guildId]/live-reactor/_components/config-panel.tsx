"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Loader2,
  Hash,
  Bell,
  Terminal,
  Megaphone,
  UserMinus,
  UserPlus,
  Gift,
  Swords,
  RotateCcw,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import {
  useStreamingStore,
  type StreamConfig,
} from "@/store/use-streaming-store";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface ConfigPanelProps {
  guildId: string;
}

const ALERT_TYPE_CONFIG = [
  {
    key: "goLive" as const,
    label: "Go Live",
    icon: Megaphone,
    color: "text-cyan-400",
  },
  {
    key: "offline" as const,
    label: "Offline",
    icon: UserMinus,
    color: "text-red-400",
  },
  {
    key: "follow" as const,
    label: "Follow",
    icon: UserPlus,
    color: "text-purple-400",
  },
  {
    key: "subscribe" as const,
    label: "Subscribe",
    icon: Bell,
    color: "text-emerald-400",
  },
  {
    key: "giftSub" as const,
    label: "Gift Sub",
    icon: Gift,
    color: "text-yellow-400",
  },
  {
    key: "raid" as const,
    label: "Raid",
    icon: Swords,
    color: "text-fuchsia-400",
  },
  {
    key: "resub" as const,
    label: "Resub",
    icon: RotateCcw,
    color: "text-blue-400",
  },
] as const;

export function ConfigPanel({ guildId }: ConfigPanelProps) {
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
              />
            </div>
          </div>

          {/* Command Prefix */}
          <div className="space-y-2 max-w-50">
            <Label variant="cyber" className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              Command Prefix
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
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALERT_TYPE_CONFIG.map(({ key, label, icon: Icon, color }) => (
              <div
                key={key}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20 transition-all",
                  localConfig.alertTypes[key] &&
                    "border-cyan-500/20 bg-cyan-500/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-4 h-4", color)} />
                  <span className="text-sm text-white font-medium">
                    {label}
                  </span>
                </div>
                <Switch
                  variant="cyan"
                  checked={localConfig.alertTypes[key]}
                  onCheckedChange={(checked) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      alertTypes: { ...prev.alertTypes, [key]: checked },
                    }))
                  }
                />
              </div>
            ))}
          </div>
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
