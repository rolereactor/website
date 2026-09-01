import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Audiowide } from "next/font/google";
import {
  Bell,
  MessageSquare,
  Zap,
  Mic,
  Shield,
  Clock,
  Hash,
  AlertCircle,
  Globe,
  ExternalLink,
  Copy,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useXPStore } from "@/store/use-xp-store";
import { useGuildStore } from "@/store/use-guild-store";

import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorView } from "@/components/common/error-view";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface XPAmount {
  base: number;
  min: number;
  max: number;
  multiplier?: number;
}

interface XPSettings {
  enabled: boolean;
  messageXP: boolean;
  commandXP: boolean;
  roleXP: boolean;
  voiceXP: boolean;
  messageXPAmount?: XPAmount;
  roleXPAmount?: number;
  commandXPAmount?: XPAmount;
  voiceXPAmount?: XPAmount;
  messageCooldown?: number;
  commandCooldown?: number;
  levelUpMessages: boolean;
  levelUpChannel?: string | null;
  publicLeaderboard?: boolean;
  [key: string]: unknown;
}

interface SettingsTabProps {
  guildId: string;
  onSavingChange?: (saving: boolean) => void;
}

const DEFAULT_XP_SETTINGS: XPSettings = {
  enabled: false,
  messageXP: true,
  commandXP: true,
  roleXP: true,
  voiceXP: true,
  messageXPAmount: { base: 20, min: 15, max: 25 },
  roleXPAmount: 10,
  commandXPAmount: { base: 50, min: 40, max: 60 },
  voiceXPAmount: { base: 30, min: 25, max: 35 },
  messageCooldown: 60,
  commandCooldown: 60,
  levelUpMessages: true,
  levelUpChannel: null,
  publicLeaderboard: true,
};

export const XPSettingsTab = forwardRef<
  { handleSave: () => Promise<void>; saving: boolean },
  SettingsTabProps
>(({ guildId, onSavingChange }, ref) => {
  const { getGuildData, isLoading, isError, fetchXPData, updateSettings } =
    useXPStore();
  const { guildData, fetchChannels } = useGuildStore();

  const { settings: globalSettings } = getGuildData(guildId);
  const channels = guildData[guildId]?.channels || [];

  useEffect(() => {
    fetchChannels(guildId);
  }, [guildId, fetchChannels]);

  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState<XPSettings | null>(null);

  useEffect(() => {
    onSavingChange?.(saving);
  }, [saving, onSavingChange]);

  // Sync internal state with global store
  useEffect(() => {
    if (globalSettings && !localSettings) {
      setLocalSettings(globalSettings);
      setLoadError(null);
    } else if (!globalSettings && !localSettings && !isLoading) {
      // If no global settings exist (failed validation or not set), use defaults
      setLocalSettings(DEFAULT_XP_SETTINGS);
      setLoadError(
        "Settings could not be loaded from server. Using default configuration."
      );
    }
  }, [globalSettings, localSettings, isLoading]);

  const handleSave = async () => {
    if (!guildId || !localSettings) return;

    setSaving(true);
    try {
      const payload = {
        experienceSystem: localSettings,
      };

      const response = await fetch(`/api/guilds/${guildId}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await response.json();
      if (data.status === "success") {
        toast.success("Configuration synchronized successfully!");
        // Update the global store with the new values
        updateSettings(guildId, localSettings);
        // Force refresh data to be sure
        fetchXPData(guildId, true);
        // Clear any load errors since save was successful
        setLoadError(null);
      } else {
        throw new Error(data.message || "Failed to save settings");
      }
    } catch (err: unknown) {
      console.error("Error saving XP settings:", err);
      const message =
        err instanceof Error ? err.message : "Failed to save settings";
      toast.error(message);
      throw err; // Re-throw so caller knows save failed
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({
    handleSave,
    saving,
  }));

  const updateLocalSetting = <T extends keyof XPSettings>(
    key: T,
    value: XPSettings[T]
  ) => {
    if (!localSettings) return;
    setLocalSettings({ ...localSettings, [key]: value });
  };

  const updateNestedLocalSetting = <
    T extends "messageXPAmount" | "commandXPAmount",
  >(
    parent: T,
    key: string,
    value: number
  ) => {
    if (!localSettings) return;
    const parentObj = localSettings[parent] as XPAmount | undefined;
    setLocalSettings({
      ...localSettings,
      [parent]: { ...(parentObj || { base: 0, min: 0, max: 0 }), [key]: value },
    });
  };

  if (isLoading && !localSettings) {
    return <SettingsSkeleton />;
  }

  if (isError && !localSettings) {
    return (
      <ErrorView
        title="CORE SYNC FAILED"
        message={
          isError.message || "Failed to load settings. Please try again later."
        }
        onRetry={() => fetchXPData(guildId, true)}
        showHome={false}
      />
    );
  }

  if (!localSettings) {
    return null;
  }

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Load Error Alert */}
      {loadError && (
        <Card
          variant="cyberpunk"
          className="border-amber-500/30 bg-amber-500/5"
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-200/80 font-bold uppercase tracking-tight">
                  {loadError}
                </p>
                <p className="text-xs text-amber-200/60 mt-1">
                  Adjust settings as needed and click "Push Settings" to save
                  them to the server.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Feature Toggle */}
      <Card
        variant="cyberpunk"
        showGrid
        className={cn(
          "transition-all duration-500",
          !localSettings.enabled && "opacity-60"
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-8">
            <div className="space-y-2">
              <Label
                htmlFor="xp-enabled"
                className={cn(
                  "text-xl font-black text-white uppercase tracking-widest",
                  audiowide.className
                )}
              >
                XP System Core
              </Label>
              <p className="text-sm text-zinc-500 font-medium max-w-xl leading-relaxed">
                Enable the XP system to start tracking activity across your
                community. Users will earn experience, gain levels, and unlock
                rewards.
              </p>
            </div>
            <Switch
              id="xp-enabled"
              checked={localSettings.enabled}
              onCheckedChange={(checked) =>
                updateLocalSetting("enabled", checked)
              }
              variant="cyan"
              className="scale-125 shadow-lg"
            />
          </div>
        </CardContent>
      </Card>

      <div
        className={cn(
          "grid gap-8 transition-all duration-700",
          !localSettings.enabled &&
            "opacity-30 grayscale pointer-events-none translate-y-4"
        )}
      >
        {/* XP Sources Grid */}
        <div className="space-y-6">
          <h3
            className={cn(
              "text-xs font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-3 px-1",
              audiowide.className
            )}
          >
            <div className="h-px bg-zinc-800 flex-1" />
            Experience Sources
            <div className="h-px bg-zinc-800 flex-1" />
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                id: "messageXP",
                label: "Chat Messages",
                icon: MessageSquare,
                color: "cyan",
                desc: "Earn XP from chat messages",
              },
              {
                id: "commandXP",
                label: "Bot Commands",
                icon: Zap,
                color: "amber",
                desc: "Earn XP from direct bot commands",
              },
              {
                id: "voiceXP",
                label: "Voice Channels",
                icon: Mic,
                color: "emerald",
                desc: "Earn XP from voice interactions",
              },
              {
                id: "roleXP",
                label: "Passive Roles",
                icon: Shield,
                color: "purple",
                desc: "Earn XP periodically for specific roles",
              },
            ].map((source) => (
              <Card
                key={source.id}
                variant="glass"
                className="hover:border-white/20"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          "p-3 rounded-xl transition-all duration-500 group-hover:scale-110",
                          source.color === "cyan" &&
                            "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
                          source.color === "amber" &&
                            "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
                          source.color === "emerald" &&
                            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15_rgba(16,185,129,0.15)]",
                          source.color === "purple" &&
                            "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                        )}
                      >
                        <source.icon className="w-5 h-5" />
                      </div>
                      <Switch
                        id={source.id}
                        checked={
                          localSettings[
                            source.id as keyof XPSettings
                          ] as boolean
                        }
                        onCheckedChange={(checked) =>
                          updateLocalSetting(source.id as string, checked)
                        }
                        variant={
                          source.color as
                            | "cyan"
                            | "amber"
                            | "emerald"
                            | "purple"
                        }
                        className="scale-90 shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={source.id}
                        className={cn(
                          "text-[13px] font-black text-white cursor-pointer uppercase tracking-widest transition-colors group-hover:text-cyan-400",
                          audiowide.className
                        )}
                      >
                        {source.label}
                      </Label>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                        {source.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* XP Rates */}
          <Card variant="cyberpunk">
            <CardHeader className="p-6 pb-4">
              <CardTitle
                className={cn(
                  "text-lg flex items-center gap-3 font-black uppercase tracking-widest text-white",
                  audiowide.className
                )}
              >
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Hash className="w-4 h-4 text-blue-400" />
                </div>
                XP Rates
              </CardTitle>
              <CardDescription className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">
                Control the amount of experience points awarded.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] uppercase text-zinc-600 font-black tracking-[0.2em]">
                  Chat XP Range (Randomized)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="min-xp"
                      className="text-[10px] text-zinc-500 font-black uppercase tracking-widest"
                    >
                      Threshold MIN
                    </Label>
                    <div className="relative group">
                      <Input
                        id="min-xp"
                        type="number"
                        variant="cyber"
                        className={cn("text-cyan-400", audiowide.className)}
                        value={localSettings.messageXPAmount?.min || 15}
                        onChange={(e) =>
                          updateNestedLocalSetting(
                            "messageXPAmount",
                            "min",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-cyan-500/30 uppercase tracking-tighter">
                        VAL
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="max-xp"
                      className="text-[10px] text-zinc-500 font-black uppercase tracking-widest"
                    >
                      Threshold MAX
                    </Label>
                    <div className="relative group">
                      <Input
                        id="max-xp"
                        type="number"
                        variant="cyber"
                        className={cn("text-cyan-400", audiowide.className)}
                        value={localSettings.messageXPAmount?.max || 25}
                        onChange={(e) =>
                          updateNestedLocalSetting(
                            "messageXPAmount",
                            "max",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-cyan-500/30 uppercase tracking-tighter">
                        VAL
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    id: "commandXPAmount",
                    label: "Network",
                    parent: true,
                    icon: Zap,
                    color: "amber",
                  },
                  {
                    id: "voiceXPAmount",
                    label: "Sonic",
                    parent: true,
                    icon: Mic,
                    color: "emerald",
                  },
                  {
                    id: "roleXPAmount",
                    label: "Status",
                    icon: Shield,
                    color: "purple",
                  },
                ].map((item) => (
                  <div key={item.id} className="space-y-2">
                    <Label className="text-[10px] text-zinc-600 font-black flex items-center gap-2 uppercase tracking-tighter">
                      <item.icon className="w-3 h-3" />
                      {item.label}
                    </Label>
                    <Input
                      id={item.id}
                      type="number"
                      variant="cyber"
                      className={cn(
                        "text-center text-sm",
                        item.color === "amber" &&
                          "focus-visible:border-amber-500/40 focus-visible:ring-amber-500/10 text-amber-400",
                        item.color === "emerald" &&
                          "focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/10 text-emerald-400",
                        item.color === "purple" &&
                          "focus-visible:border-purple-500/40 focus-visible:ring-purple-500/10 text-purple-400",
                        audiowide.className
                      )}
                      value={
                        item.parent
                          ? ((
                              localSettings[
                                item.id as keyof XPSettings
                              ] as XPAmount
                            )?.base ?? 0)
                          : ((localSettings[
                              item.id as keyof XPSettings
                            ] as number) ?? 0)
                      }
                      onChange={(e) => {
                        if (item.parent)
                          updateNestedLocalSetting(
                            item.id as "messageXPAmount" | "commandXPAmount",
                            "base",
                            parseInt(e.target.value) || 0
                          );
                        else
                          updateLocalSetting(
                            item.id as keyof XPSettings,
                            parseInt(e.target.value) || 0
                          );
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cooldowns */}
          <Card variant="cyberpunk">
            <CardHeader className="p-6 pb-4">
              <CardTitle
                className={cn(
                  "text-lg flex items-center gap-3 font-black uppercase tracking-widest text-white",
                  audiowide.className
                )}
              >
                <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <Clock className="w-4 h-4 text-orange-400" />
                </div>
                Rate Limiting
              </CardTitle>
              <CardDescription className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">
                Protect against automated experience farming.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <Label
                      htmlFor="msg-cooldown"
                      className="text-[10px] text-zinc-500 font-black uppercase tracking-widest"
                    >
                      Chat Buffer Cooldown
                    </Label>
                  </div>
                  <div className="relative group">
                    <Input
                      id="msg-cooldown"
                      type="number"
                      variant="cyber"
                      className={cn(
                        "text-orange-400 focus-visible:border-orange-500/40 focus-visible:ring-orange-500/10",
                        audiowide.className
                      )}
                      value={localSettings.messageCooldown}
                      onChange={(e) =>
                        updateLocalSetting(
                          "messageCooldown",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-orange-500/30 uppercase tracking-tighter">
                      SEC
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <Label
                      htmlFor="cmd-cooldown"
                      className="text-[10px] text-zinc-500 font-black uppercase tracking-widest"
                    >
                      Command Pulse Threshold
                    </Label>
                  </div>
                  <div className="relative group">
                    <Input
                      id="cmd-cooldown"
                      type="number"
                      variant="cyber"
                      className={cn(
                        "text-orange-400 focus-visible:border-orange-500/40 focus-visible:ring-orange-500/10",
                        audiowide.className
                      )}
                      value={localSettings.commandCooldown}
                      onChange={(e) =>
                        updateLocalSetting(
                          "commandCooldown",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-orange-500/30 uppercase tracking-tighter">
                      SEC
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 flex gap-4 backdrop-blur-md relative group overflow-hidden">
                <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
                <p className="text-[11px] text-orange-200/60 leading-relaxed font-bold uppercase tracking-tight relative z-10">
                  Buffer optimization recommended for high-load environments.
                  60s+ message thresholds ensure neural stability.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card variant="cyberpunk" className="overflow-hidden relative">
          <div className="absolute -right-10 -bottom-10 p-8 opacity-[0.03]">
            <Bell className="w-64 h-64 rotate-12" />
          </div>
          <CardHeader className="p-8 pb-4">
            <CardTitle
              className={cn(
                "text-xl flex items-center gap-4 font-black uppercase tracking-widest text-white",
                audiowide.className
              )}
            >
              <div className="p-2.5 bg-pink-500/10 border border-pink-500/20 rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                <Bell className="w-5 h-5 text-pink-400" />
              </div>
              Level Up Notifications
            </CardTitle>
            <CardDescription className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
              Configure server-wide level up announcements.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-8">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/4 transition-all duration-500 group">
              <div className="space-y-1.5">
                <Label
                  htmlFor="levelup-msg"
                  className={cn(
                    "text-base font-black text-white uppercase tracking-wider group-hover:text-pink-400 transition-colors",
                    audiowide.className
                  )}
                >
                  Enable Notifications
                </Label>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-tighter">
                  Send a celebratory message when a user levels up.
                </p>
              </div>
              <Switch
                id="levelup-msg"
                checked={localSettings.levelUpMessages}
                onCheckedChange={(checked) =>
                  updateLocalSetting("levelUpMessages", checked)
                }
                variant="pink"
                className="scale-110"
              />
            </div>

            <div className="space-y-4">
              <Label
                htmlFor="levelup-channel"
                className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.2em] px-1"
              >
                Announcement Channel
              </Label>
              <div className="w-full relative group">
                <Select
                  value={localSettings.levelUpChannel || "none"}
                  onValueChange={(value) =>
                    updateLocalSetting(
                      "levelUpChannel",
                      value === "none" ? "" : value
                    )
                  }
                >
                  <SelectTrigger
                    id="levelup-channel"
                    variant="cyber"
                    className={cn(
                      "w-full focus:ring-pink-500/10 focus:border-pink-500/40",
                      audiowide.className
                    )}
                  >
                    <SelectValue placeholder="Select a channel" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950/95 border-white/10 text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                    <SelectItem
                      value="none"
                      className="focus:bg-white/5 focus:text-pink-400 cursor-pointer py-3.5 font-bold uppercase tracking-widest text-[11px]"
                    >
                      Current Channel (Context)
                    </SelectItem>
                    {channels.map((channel) => (
                      <SelectItem
                        key={channel.id}
                        value={channel.id}
                        className="focus:bg-white/5 focus:text-pink-400 cursor-pointer py-3.5 font-bold uppercase tracking-widest text-[11px]"
                      >
                        # {channel.name.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="absolute -inset-0.5 bg-linear-to-r from-pink-500/20 to-purple-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Public Leaderboard Link */}
        <Card
          variant="cyberpunk"
          className="overflow-hidden relative border-cyan-500/30"
        >
          <div className="absolute -right-10 -bottom-10 p-8 opacity-[0.05]">
            <Globe className="w-64 h-64 rotate-12" />
          </div>
          <CardHeader className="p-8 pb-4">
            <CardTitle
              className={cn(
                "text-xl flex items-center gap-4 font-black uppercase tracking-widest text-white",
                audiowide.className
              )}
            >
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">Public Leaderboard</div>
              <Switch
                id="public-leaderboard"
                checked={localSettings.publicLeaderboard ?? true}
                onCheckedChange={(checked) =>
                  updateLocalSetting("publicLeaderboard", checked)
                }
                variant="cyan"
              />
            </CardTitle>
            <CardDescription className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
              Enable the public website link so your community can view their
              rankings. If disabled, the page will remain private.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-8">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-white/5 relative group">
              <Input
                readOnly
                value={`${process.env.NEXT_PUBLIC_WEBSITE_URL || "https://rolereactor.xyz"}/leaderboards/${guildId}`}
                className="bg-transparent border-none font-mono text-zinc-400 focus-visible:ring-0 shadow-none px-0"
              />
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${process.env.NEXT_PUBLIC_WEBSITE_URL || "https://rolereactor.xyz"}/leaderboards/${guildId}`
                  );
                  toast.success("Leaderboard link copied to clipboard!");
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button
                variant="cyber"
                size="sm"
                className="shrink-0"
                onClick={() =>
                  window.open(`/leaderboards/${guildId}`, "_blank")
                }
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
XPSettingsTab.displayName = "XPSettingsTab";

function SettingsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 bg-zinc-900 rounded-xl" />
          <Skeleton className="h-4 w-80 bg-zinc-900 rounded-lg" />
        </div>
        <Skeleton className="h-14 w-44 rounded-2xl bg-zinc-900" />
      </div>

      <Skeleton className="h-32 w-full rounded-3xl bg-zinc-900/50 border border-white/5" />

      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-44 rounded-2xl bg-zinc-900/50" />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-100 rounded-3xl bg-zinc-900/50" />
        <Skeleton className="h-100 rounded-3xl bg-zinc-900/50" />
      </div>
    </div>
  );
}
