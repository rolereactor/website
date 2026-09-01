/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Audiowide } from "next/font/google";
import {
  MessageSquare,
  Hash,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import { useGoodbyeStore } from "@/store/use-goodbye-store";
import { useGuildStore } from "@/store/use-guild-store";

import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Textarea } from "@/components/ui/textarea";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface GoodbyeSettings {
  enabled: boolean;
  channelId: string | null;
  message: string;
  embed: boolean;
}

interface SettingsTabProps {
  guildId: string;
  onSavingChange?: (saving: boolean) => void;
}

const DEFAULT_GOODBYE_SETTINGS: GoodbyeSettings = {
  enabled: false,
  channelId: null,
  message: "Goodbye {user}! We'll miss you. 👋",
  embed: false,
};

const PLACEHOLDERS = [
  { tag: "{user}", description: "User mention" },
  { tag: "{user.name}", description: "Username without mention" },
  { tag: "{user.tag}", description: "Full tag (User#1234)" },
  { tag: "{user.id}", description: "User ID" },
  { tag: "{server}", description: "Server name" },
  { tag: "{server.id}", description: "Server ID" },
  { tag: "{memberCount}", description: "Total member count" },
  {
    tag: "{memberCount.ordinal}",
    description: "Ordinal member count (1st, 2nd...)",
  },
];

export const GoodbyeSettingsTab = forwardRef<
  { handleSave: () => Promise<void>; saving: boolean },
  SettingsTabProps
>(({ guildId, onSavingChange }, ref) => {
  const { getGuildData, fetchGoodbyeData, updateSettings } = useGoodbyeStore();
  const { guildData, fetchChannels } = useGuildStore();

  const { settings: globalSettings } = getGuildData(guildId);
  const channels = guildData[guildId]?.channels || [];

  useEffect(() => {
    fetchChannels(guildId);
  }, [guildId, fetchChannels]);

  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState<GoodbyeSettings | null>(
    null
  );
  const [previewText, setPreviewText] = useState("");

  useEffect(() => {
    onSavingChange?.(saving);
  }, [saving, onSavingChange]);

  useEffect(() => {
    if (globalSettings) {
      setLocalSettings(globalSettings);
      setLoadError(null);
    } else if (!globalSettings && !localSettings) {
      setLocalSettings(DEFAULT_GOODBYE_SETTINGS);
      setLoadError(
        "No goodbye settings found. Configure your goodbye system below and click 'Push Settings' to save."
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalSettings]);

  useEffect(() => {
    if (localSettings?.message) {
      let preview = localSettings.message;
      preview = preview.replace(/{user}/g, "◈DEPARTING_MEMBER◈");
      preview = preview.replace(/{username}/g, "DepartingMember");
      preview = preview.replace(/{user.name}/g, "DepartingMember");
      preview = preview.replace(/{user.tag}/g, "DepartingMember#1234");
      preview = preview.replace(/{user.id}/g, "123456789012345678");
      preview = preview.replace(/{server}/g, "Your Server");
      preview = preview.replace(/{server.id}/g, "1124294506452361218");
      preview = preview.replace(/{memberCount}/g, "1,234");
      preview = preview.replace(/{memberCount\.ordinal}/g, "1,234th");
      setPreviewText(preview);
    }
  }, [localSettings?.message]);

  const handleSave = async () => {
    if (!guildId || !localSettings) return;

    setSaving(true);
    try {
      const payload = {
        goodbyeSystem: localSettings,
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
        toast.success("Goodbye system synchronized successfully!");
        updateSettings(guildId, localSettings);
        fetchGoodbyeData(guildId, true);
        setLoadError(null);
      } else {
        throw new Error(data.message || "Failed to save settings");
      }
    } catch (err: unknown) {
      console.error("Error saving goodbye settings:", err);
      const message =
        err instanceof Error ? err.message : "Failed to save settings";
      toast.error(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({
    handleSave,
    saving,
  }));

  const updateLocalSetting = <T extends keyof GoodbyeSettings>(
    key: T,
    value: GoodbyeSettings[T]
  ) => {
    if (!localSettings) return;
    setLocalSettings({ ...localSettings, [key]: value });
  };

  const insertPlaceholder = (placeholder: string) => {
    if (!localSettings) return;
    const textarea = document.getElementById(
      "goodbye-message"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = localSettings.message || "";
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + placeholder + after;

    setLocalSettings({ ...localSettings, message: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + placeholder.length,
        start + placeholder.length
      );
    }, 0);
  };

  if (!localSettings) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6 pb-20 relative">
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
                htmlFor="goodbye-enabled"
                className={cn(
                  "text-xl font-black text-white uppercase tracking-widest",
                  audiowide.className
                )}
              >
                Goodbye System Core
              </Label>
              <p className="text-sm text-zinc-500 font-medium max-w-xl leading-relaxed">
                Automatically send a farewell message when members leave your
                server. Show them they were valued.
              </p>
            </div>
            <Switch
              id="goodbye-enabled"
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
        {/* Goodbye Channel */}
        <Card variant="cyberpunk">
          <CardHeader className="p-6 pb-4">
            <CardTitle
              className={cn(
                "text-lg flex items-center gap-3 font-black uppercase tracking-widest text-white",
                audiowide.className
              )}
            >
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <Hash className="w-4 h-4 text-cyan-400" />
              </div>
              Goodbye Channel
            </CardTitle>
            <CardDescription className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">
              Where to send goodbye messages.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="goodbye-channel"
                className="text-[10px] text-zinc-500 font-black uppercase tracking-widest"
              >
                Select Channel
              </Label>
              <Select
                value={localSettings.channelId || "__none__"}
                onValueChange={(value) =>
                  updateLocalSetting(
                    "channelId",
                    value === "__none__" ? null : value
                  )
                }
              >
                <SelectTrigger
                  id="goodbye-channel"
                  variant="cyber"
                  className={cn(audiowide.className)}
                >
                  <SelectValue placeholder="Choose a channel..." />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="z-50 max-h-64 overflow-y-auto"
                >
                  <SelectItem value="__none__">
                    <span className="text-zinc-500">No channel selected</span>
                  </SelectItem>
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      #{channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
              The bot must have permission to send messages in this channel.
            </p>
          </CardContent>
        </Card>

        {/* Goodbye Message */}
        <Card variant="cyberpunk">
          <CardHeader className="p-8 pb-4">
            <CardTitle
              className={cn(
                "text-xl flex items-center gap-4 font-black uppercase tracking-widest text-white",
                audiowide.className
              )}
            >
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
              </div>
              Goodbye Message
            </CardTitle>
            <CardDescription className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
              Customize your goodbye message with placeholders.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <div className="space-y-4">
              <Label
                htmlFor="goodbye-message"
                className="text-[10px] text-zinc-500 font-black uppercase tracking-widest"
              >
                Message Content
              </Label>
              <Textarea
                id="goodbye-message"
                variant="cyber"
                className={cn(
                  "min-h-30 resize-none font-mono text-sm",
                  audiowide.className
                )}
                value={localSettings.message}
                onChange={(e) => updateLocalSetting("message", e.target.value)}
                placeholder="Goodbye {user}! We'll miss you. 👋"
              />
            </div>

            {/* Placeholder Quick Insert */}
            <div className="space-y-3">
              <Label className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">
                Quick Insert Placeholders
              </Label>
              <div className="flex flex-wrap gap-2">
                {PLACEHOLDERS.map((placeholder) => (
                  <Button
                    key={placeholder.tag}
                    variant="outline"
                    size="sm"
                    onClick={() => insertPlaceholder(placeholder.tag)}
                    className="text-[10px] font-mono h-7 px-3 border-zinc-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/5 hover:text-cyan-400 transition-all"
                  >
                    {placeholder.tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-3">
              <Label className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Live Preview
              </Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-4 rounded-xl bg-zinc-900/80 border border-zinc-700/50 backdrop-blur-sm">
                  {previewText ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <span className="text-sm text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">
                            {children}
                          </span>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-white">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-zinc-200">{children}</em>
                        ),
                        u: ({ children }) => (
                          <u className="underline">{children}</u>
                        ),
                      }}
                    >
                      {previewText.replace(/◈DEPARTING_MEMBER◈/g, "@DepartingMember")}
                    </ReactMarkdown>
                  ) : (
                    <span className="text-sm text-zinc-600 italic font-mono">
                      Your preview will appear here...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Embed Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/4 transition-all duration-500 group">
              <div className="space-y-1">
                <Label
                  htmlFor="embed-mode"
                  className={cn(
                    "text-sm font-black text-white uppercase tracking-widest cursor-pointer",
                    audiowide.className
                  )}
                >
                  Embed Mode
                </Label>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                  Send the message as an embed instead of plain text.
                </p>
              </div>
              <Switch
                id="embed-mode"
                checked={localSettings.embed}
                onCheckedChange={(checked) =>
                  updateLocalSetting("embed", checked)
                }
                variant="cyan"
                className="scale-100"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Card variant="cyberpunk">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 bg-zinc-800" />
              <Skeleton className="h-4 w-80 bg-zinc-800/50" />
            </div>
            <Skeleton className="h-6 w-12 bg-zinc-800 rounded-full" />
          </div>
        </CardContent>
      </Card>

      <Card variant="cyberpunk">
        <CardHeader className="p-6 pb-4">
          <Skeleton className="h-5 w-32 bg-zinc-800" />
          <Skeleton className="h-3 w-48 bg-zinc-800/50 mt-2" />
        </CardHeader>
        <CardContent className="p-6 pt-4">
          <Skeleton className="h-10 w-full bg-zinc-800" />
        </CardContent>
      </Card>

      <Card variant="cyberpunk">
        <CardHeader className="p-8 pb-4">
          <Skeleton className="h-6 w-40 bg-zinc-800" />
          <Skeleton className="h-3 w-64 bg-zinc-800/50 mt-2" />
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-4">
          <Skeleton className="h-32 w-full bg-zinc-800" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-7 w-20 bg-zinc-800" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

GoodbyeSettingsTab.displayName = "GoodbyeSettingsTab";
