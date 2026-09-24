"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Zap,
  MessagesSquare,
  Activity,
  Copy,
  Check,
  Settings2,
  ExternalLink,
  MonitorPlay,
  Play,
  Sparkles,
} from "lucide-react";
import {
  THEME_PRESETS,
  saveOverlayTheme,
  OverlayTheme,
  isPresetTheme,
} from "@/app/overlay/[guildId]/[widget]/_components/theme";
import { ThemeCustomizer } from "./theme-customizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  KickIcon,
  TwitchIcon,
  YouTubeIcon,
} from "@/components/icons/platform-icons";
import { cn } from "@/lib/utils";

interface OverlayUrlGeneratorProps {
  guildId: string;
}

const WIDGETS = [
  {
    id: "alerts",
    label: "Alert Box",
    description: "Follow, sub, raid alerts",
    icon: Zap,
  },
  {
    id: "chat",
    label: "Chat Overlay",
    description: "Live stream chat",
    icon: MessagesSquare,
  },
  {
    id: "activity",
    label: "Activity Feed",
    description: "Discord events",
    icon: Activity,
  },
] as const;

/** Curated presets — each one is distinct and production-quality. */
const THEMES = ["dark", "glass", "cyberpunk", "dreamy", "midnight"];

function StepHeader({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 border border-cyan-500/25 text-xs font-bold text-cyan-400">
        {step}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

function ConfigRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <div className="text-xs font-medium text-zinc-200">{title}</div>
        <div className="text-[10px] text-zinc-500">{description}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">{children}</div>
    </div>
  );
}

/**
 * Live preview of the widget, centered exactly like the real overlay renders
 * it: the widget sits centered in the browser source, and the streamer sizes
 * and places the source wherever they want in OBS/Streamlabs.
 */
function WidgetPreview({
  widget,
  theme,
}: {
  widget: string;
  theme: OverlayTheme;
}) {
  const textColor = theme.textColor ?? theme.text;
  const accent = theme.accent;
  const font = theme.font;
  const bubbleBg =
    theme.messageBg && theme.messageBg !== "transparent"
      ? theme.messageBg
      : "rgba(15,15,25,0.82)";

  const alertCard = (
    <div
      className="flex items-center gap-3 rounded-xl pr-5 pl-2 py-2"
      style={{
        background: bubbleBg,
        borderRadius: Math.max(theme.radius, 12),
        boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
      }}
    >
      {/* Avatar chip */}
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full"
        style={{
          background: `linear-gradient(135deg, ${accent}, ${accent}55)`,
        }}
      >
        <Zap className="size-4 text-white" />
      </div>
      <div className="text-left">
        <div
          className="text-[8px] font-bold uppercase"
          style={{ color: accent, letterSpacing: 2 }}
        >
          New Subscriber
        </div>
        <div
          className="text-[13px] font-bold leading-tight"
          style={{ color: textColor, fontFamily: font }}
        >
          Mila
        </div>
        <div
          className="text-[10px] leading-tight"
          style={{ color: textColor, opacity: 0.75 }}
        >
          just subscribed · 3 months
        </div>
      </div>
    </div>
  );

  // Same per-role colors as the real chat widget
  const svgBadge = (fill: string, path: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${fill}" d="${path}"/></svg>`
  )}`;

const _BADGE_GOLD_STAR = svgBadge(
  "#ffd700",
  "M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.5l7.1-.6z"
);
const _BADGE_GEM = svgBadge(
  "#c084fc",
  "M12 2 L21 9 L12 22 L3 9 Z M5.5 9 L12 5 L18.5 9 M8 9 L12 15 L16 9"
);

const _ROLE_COLORS: Record<string, string> = {
    Broadcaster: "#ffd166",
    Moderator: "#8ee2b0",
    VIP: "#f2a6d8",
    Subscriber: "#b7c4f7",
    Viewer: "#bab4dd",
  };
  const PLATFORM_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
    twitch: TwitchIcon,
    youtube: YouTubeIcon,
    kick: KickIcon,
  };
  const chatMock = (() => {
    const alignRight = theme.align === "right";
    const showPlatform = theme.showPlatform !== false;
    const decor = theme.decor !== false;
    const decorSymbol = theme.decorSymbol ?? "✦";

    // Same unified 5-badge set as the real widget (SVG icons, solid chips)
    const ROLES: Record<
      string,
      { glyph: React.ReactNode; color: string; label: string }
    > = {
      Broadcaster: {
        label: "Owner",
        color: "#ffd23f",
        glyph: (
          <svg viewBox="0 0 24 24" fill="#000" style={{ width: 8, height: 8 }}>
            <path d="M5 16 L2 6 L8 10 L12 4 L16 10 L22 6 L19 16 Z" />
          </svg>
        ),
      },
      Moderator: {
        label: "Moderator",
        color: "#4caf50",
        glyph: (
          <svg viewBox="0 0 24 24" fill="#fff" style={{ width: 8, height: 8 }}>
            <path d="M12 2 L4 5 v6 c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10 V5 Z" />
          </svg>
        ),
      },
      VIP: {
        label: "VIP",
        color: "#e040fb",
        glyph: (
          <svg viewBox="0 0 24 24" fill="#fff" style={{ width: 8, height: 8 }}>
            <path d="M12 2 L3 9 L12 22 L21 9 Z" />
          </svg>
        ),
      },
      OG: {
        label: "OG",
        color: "#ff7043",
        glyph: (
          <svg viewBox="0 0 24 24" fill="#fff" style={{ width: 8, height: 8 }}>
            <path d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21.5 L12 17.5 L6 21.5 L8 14 L2 9.5 L9.5 9 Z" />
          </svg>
        ),
      },
      Subscriber: {
        label: "Subscriber",
        color: "#29b6f6",
        glyph: (
          <svg viewBox="0 0 24 24" fill="#fff" style={{ width: 8, height: 8 }}>
            <path d="M12 21s-6.7-4.35-9.3-8.1C.8 10.1 1.6 6.4 4.8 5.1c2-.8 4.1 0 5.2 1.7l2 3 2-3c1.1-1.7 3.2-2.5 5.2-1.7 3.2 1.3 4 5 2.1 7.8C18.7 16.65 12 21 12 21z" />
          </svg>
        ),
      },
      Viewer: {
        label: "Viewer",
        color: "#bab4dd",
        glyph: (
          <span style={{ fontSize: 8, lineHeight: 1 }}>•</span>
        ),
      },
    };

    const header = (
      name: string,
      roleName: string,
      platform: string,
      badge?: string,
    ) => {
      const r = ROLES[roleName];
      const roleChip = (
        <span
          className="inline-flex items-center justify-center"
          style={{
            width: 13,
            height: 13,
            borderRadius: 3,
            color: "#fff",
            background: r.color,
          }}
        >
          {r.glyph}
        </span>
      );
      const platformChip = showPlatform && (
        <span
          className="inline-flex items-center justify-center"
          style={{
            width: 13,
            height: 13,
            borderRadius: 3,
            color: "#fff",
            background: platform === "twitch" ? "#9146ff" : "#ff4e45",
          }}
        >
          {(() => {
            const Icon = PLATFORM_ICONS[platform];
            return Icon ? <Icon size={8} /> : null;
          })()}
        </span>
      );
      const bullet = (
        <span
          className="text-[7px]"
          style={{ color: r.color, opacity: 0.6 }}
        >
          •
        </span>
      );
      const nameEl = (
        <span
          className="text-[10px] font-bold"
          style={{ color: accent, fontFamily: font }}
        >
          {name}
        </span>
      );

      // Mirrors the real ChatMessageRight header: same child order as left
      // mode, with the whole group pinned to the right edge so badges stay
      // in front of the name and the bullet separates it from the rail.
      return (
        <div
          className="flex items-center gap-1.5"
          style={{ justifyContent: alignRight ? "flex-end" : "flex-start" }}
        >
          {roleChip}
          {badge && (
            <Image
              unoptimized
              src={badge}
              alt=""
              width={13}
              height={13}
              style={{
                borderRadius: 3,
                objectFit: "contain",
              }}
            />
          )}
          {platformChip}
          {nameEl}
          {bullet}
        </div>
      );
    };

    const bubble = (text: string) => (
      <div
        className="inline-block max-w-full text-[10px] leading-snug"
        style={{
          background: bubbleBg,
          borderRadius: theme.messageRadius ?? 10,
          padding: "4px 9px",
          color: textColor,
          fontFamily: font,
          boxShadow: "0 2px 8px rgba(20,16,60,0.2)",
          textAlign: alignRight ? "right" : "left",
        }}
      >
        <span className="opacity-95">{text}</span>
      </div>
    );

    const event = (glyph: string, name: string, text: string) => (
      <div
        className="flex"
        style={{
          flexDirection: alignRight ? "row-reverse" : "row",
          gap: 6,
          alignItems: "stretch",
          width: "100%",
        }}
      >
        {decor && (
          <div
            style={{
              position: "relative",
              width: 14,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                height: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.eventColor ?? accent,
                fontSize: 9,
                lineHeight: 1,
                textShadow: `0 0 8px ${theme.eventColor ?? accent}88`,
                zIndex: 1,
              }}
            >
              {glyph}
            </span>
            <div
              style={{
                position: "relative",
                flex: 1,
                width: 1,
                marginTop: 3,
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 2px, transparent 2px, transparent 4px)",
              }}
            />
          </div>
        )}
        <div
          className="flex min-w-0 flex-1 items-baseline text-[10px]"
          style={{
            justifyContent: alignRight ? "flex-end" : "flex-start",
            fontFamily: font,
            textAlign: alignRight ? "right" : "left",
          }}
        >
          <span
            className="font-bold"
            style={{ color: theme.eventColor ?? accent, marginRight: 5 }}
          >
            {name}
          </span>
          <span style={{ color: textColor, fontWeight: 500 }}> {text}</span>
        </div>
      </div>
    );

    const row = (
      name: string,
      roleName: string,
      platform: string,
      text: string,
      badge?: string,
    ) => (
      <div
        className="flex"
        style={{
          flexDirection: alignRight ? "row-reverse" : "row",
          gap: 6,
          alignItems: "stretch",
          width: "100%",
        }}
      >
        {decor && (
          <div
            style={{
              position: "relative",
              width: 14,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                height: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.eventColor ?? accent,
                fontSize: 10,
                lineHeight: 1,
                textShadow: `0 0 8px ${theme.eventColor ?? accent}66`,
                zIndex: 1,
              }}
            >
              {decorSymbol}
            </span>
            <div
              style={{
                position: "relative",
                flex: 1,
                width: 1,
                marginTop: 3,
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 2px, transparent 2px, transparent 4px)",
              }}
            />
          </div>
        )}
        <div
          className="flex min-w-0 flex-1 flex-col gap-1"
          style={{ alignItems: alignRight ? "flex-end" : "flex-start" }}
        >
          {header(name, roleName, platform, badge)}
          {bubble(text)}
        </div>
      </div>
    );

    return (
      <div
        className="flex w-56 flex-col"
        style={{
          background: theme.panelBg ?? "transparent",
          border: theme.panelBorder,
          borderRadius: Math.min(theme.panelRadius ?? 28, 16),
          backdropFilter: theme.panelBg ? "blur(10px)" : undefined,
          alignItems: alignRight ? "flex-end" : "flex-start",
          justifyContent: "flex-end",
          gap: 7,
          padding: "12px 13px",
        }}
      >
        {row("StreamHost", "Broadcaster", "twitch", "welcome to the stream everyone!")}
        {row("ModMaven", "Moderator", "twitch", "Chat, keep it cozy in here ⚔")}
        {row("CrystalVIP", "VIP", "twitch", "first time catching the stream live")}
        {row("wren99", "OG", "kick", "been here since day one")}
        {row("SubStar", "Subscriber", "youtube", "hey everyone, loving the vibe")}
        {row("FreshFace", "Viewer", "youtube", "just found the stream, instant follow")}
        {event("✦", "Mila", "just resubscribed 10 months!")}
        {event("💎", "Milaeshop", "sent a Super Chat · $50!")}
        {event("☄", "StudioStream", "is raiding with 128 viewers!")}
      </div>
    );
  })();

    const activityMock = (
    <div className="w-52 space-y-1.5">
      {[
        { icon: "👋", name: "Nova", text: "joined the server", color: "#00ff88" },
        { icon: "🎁", name: "RaidLeader", text: "entered the giveaway", color: "#ffd700" },
        { icon: "💰", name: "StellarFan", text: "donated $10", color: "#ff9944" },
      ].map((r) => (
        <div
          key={r.name}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10px]"
          style={{
            background: bubbleBg,
            borderRadius: theme.messageRadius ?? theme.radius,
            borderLeft: `3px solid ${r.color}`,
            color: textColor,
            fontFamily: font,
            boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
          }}
        >
          <span>{r.icon}</span>
          <span className="font-semibold" style={{ color: r.color }}>
            {r.name}
          </span>
          <span className="opacity-80 truncate">{r.text}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {widget === "alerts" && alertCard}
      {widget === "chat" && chatMock}
      {widget === "activity" && activityMock}
    </div>
  );
}

export function OverlayUrlGenerator({ guildId }: OverlayUrlGeneratorProps) {
  const [selectedWidget, setSelectedWidget] = useState<string>("alerts");
  const [selectedTheme, setSelectedTheme] = useState<string>("dark");
  const [customTheme, setCustomTheme] = useState<OverlayTheme | null>(null);
  const [customThemeName, setCustomThemeName] = useState<string>("");
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [overlayUrl, setOverlayUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [chatPanel, setChatPanel] = useState(true);
  const [chatAlign, setChatAlign] = useState<"left" | "right">("left");
  const [chatDecor, setChatDecor] = useState(true);
  const [chatDecorSymbol, setChatDecorSymbol] = useState("✦");
  const [chatShowPlatform, setChatShowPlatform] = useState(true);


  const activeTheme = customTheme || THEME_PRESETS[selectedTheme] || THEME_PRESETS.dark;

  // Chat-specific display options applied on top of the chosen preset
  const effectiveTheme = useMemo<OverlayTheme>(() => {
    if (selectedWidget !== "chat") return activeTheme;
    return {
      ...activeTheme,
      panelBg: chatPanel ? activeTheme.panelBg : undefined,
      panelBorder: chatPanel ? activeTheme.panelBorder : undefined,
      align: chatAlign,
      decor: chatDecor,
      decorSymbol: chatDecorSymbol,
      showPlatform: chatShowPlatform,
    };
  }, [activeTheme, selectedWidget, chatPanel, chatAlign, chatDecor, chatShowPlatform, chatDecorSymbol]);
  const activeThemeName = customThemeName || selectedTheme;
  const isPreset = isPresetTheme(selectedTheme) && !customTheme;

  const handlePresetChange = useCallback((presetName: string) => {
    setSelectedTheme(presetName);
    setCustomTheme(null);
    setCustomThemeName("");
  }, []);

  const handleThemeChange = useCallback((theme: OverlayTheme) => {
    setCustomTheme(theme);
  }, []);

  const handleThemeNameChange = useCallback((name: string) => {
    setCustomThemeName(name);
  }, []);

  const handleResetTheme = useCallback(() => {
    setCustomTheme(null);
    setCustomThemeName("");
  }, []);

  const handleDuplicateTheme = useCallback(() => {
    const newName = `${activeThemeName} (Copy)`;
    setCustomTheme({ ...activeTheme });
    setCustomThemeName(newName);
  }, [activeTheme, activeThemeName]);

  const handleDeleteTheme = useCallback(() => {
    if (!isPreset) {
      setCustomTheme(null);
      setCustomThemeName("");
      setSelectedTheme("dark");
    }
  }, [isPreset]);

  // Save on every theme/options change so any open overlay URL for this
  // guild picks it up live (via the cross-tab storage event) — Generate is
  // only needed for the token/URL itself.
  useEffect(() => {
    saveOverlayTheme(guildId, selectedWidget, effectiveTheme);
  }, [guildId, selectedWidget, effectiveTheme]);

  const generateUrl = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/stream/${guildId}/overlay-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widget: selectedWidget }),
      });
      const data = await res.json();
      if (data.success !== false && data.url) {
        saveOverlayTheme(guildId, selectedWidget, effectiveTheme);
        setOverlayUrl(data.url);
      }
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  }, [guildId, selectedWidget, effectiveTheme]);

  const copyUrl = useCallback(() => {
    if (overlayUrl) {
      navigator.clipboard.writeText(overlayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [overlayUrl]);

  const openDemo = useCallback(
    (mode: "true" | "all") => {
      if (!overlayUrl) return;
      const sep = overlayUrl.includes("?") ? "&" : "?";
      window.open(
        `${overlayUrl}${sep}demo=${mode}`,
        "_blank",
        "noopener,noreferrer"
      );
    },
    [overlayUrl]
  );

  const isAmbient = Boolean(activeTheme.bgImage);

  return (
    <div className="flex flex-col xl:flex-row gap-5 xl:gap-6">
      {/* Left: setup steps */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Step 1 — widget */}
        <section className="space-y-3">
          <StepHeader
            step={1}
            title="Choose a widget"
            description="What should this browser source show?"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {WIDGETS.map((w) => {
              const selected = selectedWidget === w.id;
              const Icon = w.icon;
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWidget(w.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                    selected
                      ? "border-cyan-500/50 bg-cyan-500/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      selected
                        ? "bg-cyan-500/15 text-cyan-400"
                        : "bg-white/5 text-zinc-400"
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "text-sm font-medium whitespace-nowrap",
                        selected ? "text-white" : "text-zinc-200"
                      )}
                    >
                      {w.label}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                      {w.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2 — theme */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <StepHeader
              step={2}
              title="Pick a theme"
              description="Preview updates as you choose."
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomizer(true)}
              className="h-8 shrink-0 text-xs"
            >
              <Settings2 className="size-3.5 mr-1.5" />
              Customize
              {customTheme && (
                <span className="ml-1.5 text-[10px] text-cyan-400">
                  ({customThemeName || "custom"} edits)
                </span>
              )}
            </Button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {THEMES.map((name) => {
                    const preset = THEME_PRESETS[name];
                    if (!preset) return null;
                    const selected = selectedTheme === name && !customTheme;
                    return (
                      <button
                        key={name}
                        onClick={() => handlePresetChange(name)}
                        className={cn(
                          "group rounded-lg border p-1.5 text-left transition-all cursor-pointer",
                          selected
                            ? "border-cyan-500/60 bg-cyan-500/10"
                            : "border-white/10 bg-white/[0.02] hover:border-white/25"
                        )}
                      >
                        <div
                          className="h-10 rounded-md border border-black/30 overflow-hidden relative"
                          style={{
                            background: preset.bgImage
                              ? `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url(${preset.bgImage}) center/cover`
                              : preset.bg,
                            backgroundColor: preset.bgImage ? undefined : "#111",
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                            <span
                              className="size-2 rounded-full"
                              style={{ background: preset.accent }}
                            />
                            <span
                              className="text-[11px] font-semibold"
                              style={{
                                color: preset.textColor ?? preset.text,
                                fontFamily: preset.font,
                              }}
                            >
                              Aa
                            </span>
                          </div>
                        </div>
                        <div
                          className={cn(
                            "mt-1.5 px-0.5 text-[11px] font-medium capitalize truncate",
                            selected ? "text-cyan-300" : "text-zinc-400 group-hover:text-zinc-300"
                          )}
                        >
                          {name}
                        </div>
                      </button>
                    );
                  })}
          </div>

          {/* Chat display options */}
          {selectedWidget === "chat" && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-1 divide-y divide-white/[0.06]">
              <ConfigRow
                title="Chat panel"
                description="Box behind messages — turn off for text only"
              >
                <Switch
                  variant="cyan"
                  checked={chatPanel}
                  onCheckedChange={setChatPanel}
                />
              </ConfigRow>
              <ConfigRow
                title="Decoration"
                description="Dashed rail beside messages"
              >
                {chatDecor && (
                  <Input
                    value={chatDecorSymbol}
                    onChange={(e) =>
                      setChatDecorSymbol(e.target.value.slice(0, 2) || "✦")
                    }
                    maxLength={2}
                    title="Decoration symbol"
                    className="w-12 h-8 text-center text-sm px-1"
                  />
                )}
                <Switch
                  variant="cyan"
                  checked={chatDecor}
                  onCheckedChange={setChatDecor}
                />
              </ConfigRow>
              <ConfigRow
                title="Platform badge"
                description="Show where the message came from"
              >
                <Switch
                  variant="cyan"
                  checked={chatShowPlatform}
                  onCheckedChange={setChatShowPlatform}
                />
              </ConfigRow>
              <ConfigRow
                title="Anchor"
                description="Aligns messages to the left or right side of the widget"
              >
                <div className="flex rounded-lg border border-white/10 p-0.5">
                  {(["left", "right"] as const).map((side) => (
                    <button
                      key={side}
                      onClick={() => setChatAlign(side)}
                      className={cn(
                        "rounded-md px-3 py-1 text-[11px] font-medium capitalize transition-colors cursor-pointer",
                        chatAlign === side
                          ? "bg-cyan-500/15 text-cyan-300"
                          : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {side}
                    </button>
                  ))}
                </div>
              </ConfigRow>
            </div>
          )}
        </section>
      </div>

      {/* Right: live preview + streaming-software setup */}
      <div className="xl:w-[400px] shrink-0">
        <div className="xl:sticky xl:top-4 space-y-4">
          <section className="space-y-3">
            <StepHeader
              step={3}
              title="Preview & add to your stream"
              description={
                customTheme
                  ? "Showing your customized theme"
                  : `Theme: ${activeThemeName}`
              }
            />

            {/* Live preview */}
            <div
              className="relative h-[520px] rounded-xl border border-white/10 overflow-hidden"
              style={{
                background: isAmbient
                  ? undefined
                  : "linear-gradient(135deg, #1c1c2e 0%, #101018 60%, #0a0a12 100%)",
              }}
            >
              {activeTheme.bgImage && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${activeTheme.bgImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: `blur(${Math.min(activeTheme.bgBlur ?? 40, 24)}px)`,
                    transform: "scale(1.15)",
                  }}
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 20%, rgba(80,80,140,0.18), transparent 55%), radial-gradient(circle at 75% 70%, rgba(40,60,110,0.22), transparent 60%)",
                }}
              />
              <WidgetPreview widget={selectedWidget} theme={effectiveTheme} />
            </div>

            {/* Generate / URL */}
            {!overlayUrl ? (
              <Button
                onClick={generateUrl}
                disabled={generating}
                className="w-full h-9"
              >
                <MonitorPlay className="size-4 mr-2" />
                {generating ? "Generating…" : "Generate Overlay URL"}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={overlayUrl}
                    readOnly
                    className="font-mono text-[11px] h-9"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0"
                    onClick={copyUrl}
                    title="Copy URL"
                  >
                    {copied ? (
                      <Check className="size-4 text-emerald-400" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0"
                    onClick={() => window.open(overlayUrl, "_blank", "noopener,noreferrer")}
                    title="Open preview in new tab"
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Add a Browser Source in your streaming software (OBS,
                  Streamlabs, …), paste this URL, and size the source to fit
                  the widget — then place it anywhere on your scene.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-zinc-500">
                    Preview without going live:
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={() => openDemo("true")}
                    title="Randomized live simulation — a message every few seconds, an event every ~20s"
                  >
                    <Play className="size-3 mr-1" />
                    Live demo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={() => openDemo("all")}
                    title="One message per role, then every event type in order"
                  >
                    <Sparkles className="size-3 mr-1" />
                    All events
                  </Button>
                  <button
                    onClick={() => setOverlayUrl("")}
                    className="ml-auto text-[11px] text-zinc-500 hover:text-zinc-300 shrink-0 cursor-pointer"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Theme Customizer Slide-out Panel — non-modal, opens left so the live
          preview column stays bright and the rest of the page stays usable
          while tuning (theme cards, anchor, widget choice all still work) */}
      <Sheet modal={false} open={showCustomizer} onOpenChange={setShowCustomizer}>
        <SheetContent
          side="left"
          overlay={false}
          onInteractOutside={(e) => e.preventDefault()}
          className="w-[400px] sm:w-[540px] overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Theme Customizer</SheetTitle>
            <SheetDescription>
              Fine-tune your overlay theme. Changes preview in real-time.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <ThemeCustomizer
              theme={activeTheme}
              themeName={activeThemeName}
              onThemeChange={handleThemeChange}
              onThemeNameChange={handleThemeNameChange}
              onReset={customTheme ? handleResetTheme : undefined}
              onDuplicate={handleDuplicateTheme}
              onDelete={!isPreset ? handleDeleteTheme : undefined}
              presetName={selectedTheme}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
