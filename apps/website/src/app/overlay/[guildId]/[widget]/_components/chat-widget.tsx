"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { KickIcon, TwitchIcon, YouTubeIcon } from "@/components/icons/platform-icons";
import type { OverlayTheme } from "./theme";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  username: string;
  message: string;
  color?: string;
  isBroadcaster?: boolean;
  isOwner?: boolean;
  isMod?: boolean;
  isModerator?: boolean;
  isSubscriber?: boolean;
  /** YouTube channel membership (maps to the Subscriber role) */
  isMember?: boolean;
  /** Kick OG badge */
  isOg?: boolean;
  isVip?: boolean;
  /** Source platform, e.g. "twitch" | "youtube" | "kick" */
  platform?: string;
  /**
   * Real platform badge image URLs (Twitch Helix /chat/badges, YouTube, …),
   * resolved by the bot. Rendered in front of the username.
   */
  badges?: string[];
  timestamp: number;
}

export interface StreamAlert {
  type: string;
  username: string;
  message?: string;
  tier?: string;
  viewers?: number;
  cumulativeMonths?: number;
  total?: number;
  /** Super Chat amount */
  amount?: number;
  timestamp: number;
}

interface ChatEvent {
  username: string;
  text: string;
  glyph: string;
  timestamp: number;
}

interface ChatWidgetProps {
  messages: unknown[];
  theme: OverlayTheme;
  params: URLSearchParams;
  alerts?: unknown[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Unified role badge set — exactly 5, covering every role on all platforms:
 *   Owner      (crown)  — Twitch broadcaster / YouTube owner / Kick broadcaster
 *   Moderator  (shield) — Twitch + Kick mods, YouTube chat moderators
 *   VIP        (diamond)— Twitch + Kick VIPs (no YouTube equivalent)
 *   OG         (star)   — Kick OGs only
 *   Subscriber (heart)  — Twitch subs/founders, YouTube members, Kick subs
 * Users with none of these render with no badge, like native chat.
 */
const ROLE_BADGES = {
  owner: {
    label: "Owner",
    color: "#ffd23f",
    icon: (
      <svg viewBox="0 0 24 24" fill="#000">
        <path d="M5 16 L2 6 L8 10 L12 4 L16 10 L22 6 L19 16 Z" />
      </svg>
    ),
  },
  moderator: {
    label: "Moderator",
    color: "#4caf50",
    icon: (
      <svg viewBox="0 0 24 24" fill="#fff">
        <path d="M12 2 L4 5 v6 c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10 V5 Z" />
      </svg>
    ),
  },
  vip: {
    label: "VIP",
    color: "#e040fb",
    icon: (
      <svg viewBox="0 0 24 24" fill="#fff">
        <path d="M12 2 L3 9 L12 22 L21 9 Z" />
      </svg>
    ),
  },
  og: {
    label: "OG",
    color: "#ff7043",
    icon: (
      <svg viewBox="0 0 24 24" fill="#fff">
        <path d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21.5 L12 17.5 L6 21.5 L8 14 L2 9.5 L9.5 9 Z" />
      </svg>
    ),
  },
  subscriber: {
    label: "Subscriber",
    color: "#29b6f6",
    icon: (
      <svg viewBox="0 0 24 24" fill="#fff">
        <path d="M12 21s-6.7-4.35-9.3-8.1C.8 10.1 1.6 6.4 4.8 5.1c2-.8 4.1 0 5.2 1.7l2 3 2-3c1.1-1.7 3.2-2.5 5.2-1.7 3.2 1.3 4 5 2.1 7.8C18.7 16.65 12 21 12 21z" />
      </svg>
    ),
  },
} as const;

type RoleKey = keyof typeof ROLE_BADGES;

const PLATFORM_COLORS: Record<string, string> = {
  twitch: "#9146ff",
  youtube: "#ff4e45",
  kick: "#53fc18",
};

const PLATFORM_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  twitch: TwitchIcon,
  youtube: YouTubeIcon,
  kick: KickIcon,
};

const EVENT_GLYPHS: Record<string, string> = {
  resub: "✦",
  subscribe: "❀",
  giftSub: "❁",
  raid: "☄",
  follow: "✧",
  superChat: "💎",
  superSticker: "🎁",
  goLive: "🔴",
  offline: "🌙",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Resolve a message's unified role from its flags; null = plain viewer. */
function resolveRole(m: ChatMessage): RoleKey | null {
  if (m.isBroadcaster || m.isOwner) return "owner";
  if (m.isMod || m.isModerator) return "moderator";
  if (m.isVip) return "vip";
  if (m.isOg) return "og";
  if (m.isSubscriber || m.isMember) return "subscriber";
  return null;
}

/** Convert a stream alert into a chat event line (null = not renderable). */
function alertToEvent(a: StreamAlert): ChatEvent | null {
  switch (a.type) {
    case "goLive":
      return {
        username: "Stream",
        text: "is now LIVE — come hang out!",
        glyph: EVENT_GLYPHS.goLive,
        timestamp: a.timestamp,
      };
    case "offline":
      return {
        username: "Stream",
        text: "just ended — thanks for hanging out!",
        glyph: EVENT_GLYPHS.offline,
        timestamp: a.timestamp,
      };
    case "resub":
      return {
        username: a.username,
        text: `just resubscribed${a.cumulativeMonths ? ` ${a.cumulativeMonths} months` : ""}!`,
        glyph: EVENT_GLYPHS.resub,
        timestamp: a.timestamp,
      };
    case "subscribe":
      return { username: a.username, text: "just subscribed!", glyph: EVENT_GLYPHS.subscribe, timestamp: a.timestamp };
    case "giftSub":
      return {
        username: a.username,
        text: `gifted${a.total ? ` ${a.total}` : ""} subs!`,
        glyph: EVENT_GLYPHS.giftSub,
        timestamp: a.timestamp,
      };
    case "raid":
      return {
        username: a.username,
        text: `is raiding${a.viewers ? ` with ${a.viewers} viewers` : ""}!`,
        glyph: EVENT_GLYPHS.raid,
        timestamp: a.timestamp,
      };
    case "follow":
      return { username: a.username, text: "just followed!", glyph: EVENT_GLYPHS.follow, timestamp: a.timestamp };
    case "superChat": {
      const amount = a.amount ?? a.total;
      return {
        username: a.username,
        text: `sent a Super Chat${amount ? ` · $${amount}` : ""}!`,
        glyph: EVENT_GLYPHS.superChat,
        timestamp: a.timestamp,
      };
    }
    case "superSticker":
      return {
        username: a.username,
        text: "sent a Super Sticker!",
        glyph: EVENT_GLYPHS.superSticker,
        timestamp: a.timestamp,
      };
    default:
      return null;
  }
}

/** Smoothly fades a row out after `fadeSeconds` (0 disables fading). */
function useFadeOut(fadeSeconds: number) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (fadeSeconds > 0 && ref.current) {
      const timer = setTimeout(() => {
        if (ref.current) {
          ref.current.style.transition = "opacity 0.7s ease, transform 0.7s ease";
          ref.current.style.opacity = "0";
          ref.current.style.transform = "translateY(-8px)";
        }
      }, fadeSeconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [fadeSeconds]);
  return ref;
}

// ─── Reusable pieces ────────────────────────────────────────────────────────

function _Chip({
  children,
  color,
  theme,
  size,
  title,
}: {
  children: React.ReactNode;
  color: string;
  theme: OverlayTheme;
  size: number;
  title?: string;
}) {
  return (
    <span
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: "9999px",
        color,
        background: theme.panelBg ?? "rgba(15,14,30,0.9)",
        border: `1px solid ${color}44`,
        fontSize: Math.max(size - 10, 8),
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}

/** Platform icon chip — same rounded-square shape and size as role badges. */
export function PlatformChip({
  platform,
  size,
}: {
  platform: string;
  size: number;
}) {
  const key = platform.toLowerCase();
  const color = PLATFORM_COLORS[key] ?? "#9ca3af";
  const Icon = PLATFORM_ICONS[key];
  return (
    <span
      title={platform}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: 4,
        color: "#fff",
        background: color,
      }}
    >
      {Icon ? (
        <Icon size={Math.max(size - 11, 8)} />
      ) : (
        <span style={{ fontSize: 7, fontWeight: 700 }}>
          {key.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}

/**
 * Message layout shared bits.
 */
function DecorationRail({
  theme,
  symbol,
  size,
}: {
  theme: OverlayTheme;
  symbol: string;
  size: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: size + 6,
        flexShrink: 0,
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <span
        aria-hidden
        style={{
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.eventColor ?? theme.accent,
          fontSize: Math.max(theme.fontSize + 1, 14),
          lineHeight: 1,
          textShadow: `0 0 10px ${theme.eventColor ?? theme.accent}66`,
          zIndex: 1,
        }}
      >
        {symbol}
      </span>
      <div
        style={{
          position: "relative",
          flex: 1,
          width: 1,
          marginTop: 4,
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 7px, transparent 7px, transparent 10px)",
        }}
      />
    </div>
  );
}

/**
 * Message for a LEFT-positioned chatbox: decoration rail on the left,
 * header and bubble left-aligned. Customize freely — it only renders left.
 */
export function ChatMessageLeft({
  message,
  theme,
  fadeSeconds,
}: {
  message: ChatMessage;
  theme: OverlayTheme;
  fadeSeconds: number;
}) {
  const ref = useFadeOut(fadeSeconds);
  const roleKey = resolveRole(message);
  const roleBadge = roleKey ? ROLE_BADGES[roleKey] : null;

  const decor = theme.decor !== false;
  const showPlatform = theme.showPlatform !== false;
  const platformKey = message.platform?.toLowerCase();
  const _platformColor = platformKey
    ? PLATFORM_COLORS[platformKey] ?? "#9ca3af"
    : undefined;
  const _PlatformIcon = platformKey ? PLATFORM_ICONS[platformKey] : undefined;
  const chipSize = Math.max(theme.fontSize + 6, 20);
  // Real platform badges already identify the role — the unified role badge
  // is only the fallback when the bot sent none.
  const hasRealBadges = Boolean(message.badges?.length);

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        gap: decor ? 8 : 0,
        alignItems: "stretch",
      }}
    >
      {decor && (
        <DecorationRail theme={theme} symbol={theme.decorSymbol ?? "✦"} size={chipSize} />
      )}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {/* Header — role badge, platform badges and chip in front of the name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            height: chipSize,
            marginBottom: 4,
            fontSize: theme.fontSize,
          }}
        >
          {roleBadge && !hasRealBadges && (
            <span
              title={roleBadge.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                width: chipSize,
                height: chipSize,
                borderRadius: 4,
                color: "#fff",
                background: roleBadge.color,
                fontSize: Math.max(theme.fontSize - 5, 9),
              }}
            >
              {roleBadge.icon}
            </span>
          )}
          {showPlatform &&
            message.badges?.map((url, bi) => (
              <Image
                key={bi}
                unoptimized
                src={url}
                alt=""
                referrerPolicy="no-referrer"
                width={chipSize}
                height={chipSize}
                style={{
                  borderRadius: 4,
                  objectFit: "contain",
                }}
              />
            ))}
          {showPlatform && platformKey && (
            <PlatformChip platform={platformKey} size={chipSize} />
          )}
          <span
            style={{
              fontWeight: theme.usernameWeight ?? 700,
              color: message.color || theme.accent,
              lineHeight: 1,
            }}
          >
            {message.username}
          </span>
        </div>

        {/* Message bubble */}
        <div
          style={{
            background: theme.messageBg,
            borderRadius: theme.messageRadius ?? 10,
            padding: theme.messagePadding ?? "8px 14px",
            color: theme.textColor ?? theme.text,
            fontSize: theme.fontSize,
            fontWeight: theme.fontWeight ?? 400,
            lineHeight: theme.lineHeight ?? 1.45,
            textShadow: theme.textShadow ?? "none",
            wordWrap: "break-word",
            maxWidth: "100%",
            textAlign: "left",
            boxShadow: "0 3px 12px rgba(20,16,60,0.22)",
          }}
        >
          <span style={{ opacity: 0.95 }}>{message.message}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Message for a RIGHT-positioned chatbox: decoration rail on the right,
 * header and bubble right-aligned. Customize freely — it only renders right.
 */
export function ChatMessageRight({
  message,
  theme,
  fadeSeconds,
}: {
  message: ChatMessage;
  theme: OverlayTheme;
  fadeSeconds: number;
}) {
  const ref = useFadeOut(fadeSeconds);
  const roleKey = resolveRole(message);
  const roleBadge = roleKey ? ROLE_BADGES[roleKey] : null;

  const decor = theme.decor !== false;
  const showPlatform = theme.showPlatform !== false;
  const platformKey = message.platform?.toLowerCase();
  const _platformColor = platformKey
    ? PLATFORM_COLORS[platformKey] ?? "#9ca3af"
    : undefined;
  const _PlatformIcon = platformKey ? PLATFORM_ICONS[platformKey] : undefined;
  const chipSize = Math.max(theme.fontSize + 6, 20);
  const hasRealBadges = Boolean(message.badges?.length);

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        gap: decor ? 8 : 0,
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        {/* Header — same badge order as left mode (badges stay in front of
            the name); the bullet sits between the name and the decoration
            rail, and the whole row is pinned to the right edge. */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 5,
            height: chipSize,
            marginBottom: 4,
            fontSize: theme.fontSize,
          }}
        >
          {roleBadge && !hasRealBadges && (
            <span
              title={roleBadge.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                width: chipSize,
                height: chipSize,
                borderRadius: 4,
                color: "#fff",
                background: roleBadge.color,
                fontSize: Math.max(theme.fontSize - 5, 9),
              }}
            >
              {roleBadge.icon}
            </span>
          )}
          {showPlatform &&
            message.badges?.map((url, bi) => (
              <Image
                key={bi}
                unoptimized
                src={url}
                alt=""
                referrerPolicy="no-referrer"
                width={chipSize}
                height={chipSize}
                style={{
                  borderRadius: 4,
                  objectFit: "contain",
                }}
              />
            ))}
          {showPlatform && platformKey && (
            <PlatformChip platform={platformKey} size={chipSize} />
          )}
          <span
            style={{
              fontWeight: theme.usernameWeight ?? 700,
              color: message.color || theme.accent,
              lineHeight: 1,
            }}
          >
            {message.username}
          </span>
        </div>

        {/* Message bubble */}
        <div
          style={{
            background: theme.messageBg,
            borderRadius: theme.messageRadius ?? 10,
            padding: theme.messagePadding ?? "8px 14px",
            color: theme.textColor ?? theme.text,
            fontSize: theme.fontSize,
            fontWeight: theme.fontWeight ?? 400,
            lineHeight: theme.lineHeight ?? 1.45,
            textShadow: theme.textShadow ?? "none",
            wordWrap: "break-word",
            maxWidth: "100%",
            textAlign: "right",
            boxShadow: "0 3px 12px rgba(20,16,60,0.22)",
          }}
        >
          <span style={{ opacity: 0.95 }}>{message.message}</span>
        </div>
      </div>
      {decor && (
        <DecorationRail theme={theme} symbol={theme.decorSymbol ?? "✦"} size={chipSize} />
      )}
    </div>
  );
}

/** Dispatches to the left or right variant based on the chat position. */
export function ChatMessageRow({
  message,
  theme,
  fadeSeconds,
  alignRight,
}: {
  message: ChatMessage;
  theme: OverlayTheme;
  fadeSeconds: number;
  alignRight: boolean;
}) {
  return alignRight ? (
    <ChatMessageRight message={message} theme={theme} fadeSeconds={fadeSeconds} />
  ) : (
    <ChatMessageLeft message={message} theme={theme} fadeSeconds={fadeSeconds} />
  );
}

/** Stream event line (resub, raid, super chat, …) rendered inside the feed.
 *  Uses the same decoration rail as chat messages so glyphs stay aligned. */
export function EventLine({
  event,
  theme,
  fadeSeconds,
  alignRight,
}: {
  event: ChatEvent;
  theme: OverlayTheme;
  fadeSeconds: number;
  alignRight: boolean;
}) {
  const ref = useFadeOut(fadeSeconds);
  const decor = theme.decor !== false;
  const glyphColor = theme.eventColor ?? theme.accent;
  const chipSize = Math.max(theme.fontSize + 6, 20);

  const rail = decor && (
    <div
      style={{
        position: "relative",
        width: chipSize + 6,
        flexShrink: 0,
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <span
        aria-hidden
        style={{
          height: chipSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: glyphColor,
          fontSize: Math.max(theme.fontSize - 3, 11),
          lineHeight: 1,
          textShadow: `0 0 10px ${glyphColor}88`,
          zIndex: 1,
        }}
      >
        {event.glyph}
      </span>
      <div
        style={{
          position: "relative",
          flex: 1,
          width: 1,
          marginTop: 4,
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 2px, transparent 2px, transparent 5px)",
        }}
      />
    </div>
  );

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: alignRight ? "row-reverse" : "row",
        gap: decor ? 8 : 0,
        alignItems: "stretch",
      }}
    >
      {rail}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "baseline",
          justifyContent: alignRight ? "flex-end" : "flex-start",
          margin: "4px 0",
          fontSize: theme.fontSize,
          lineHeight: 1.4,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: glyphColor,
            marginRight: 6,
          }}
        >
          {event.username}
        </span>
        <span style={{ color: theme.textColor ?? theme.text, fontWeight: 500 }}>
          {event.text}
        </span>
      </div>
    </div>
  );
}

// ─── Widget ─────────────────────────────────────────────────────────────────

export function ChatWidget({ messages, theme, params, alerts }: ChatWidgetProps) {
  // Research: 5-8 visible messages, not too many
  const maxMessages = Math.min(Math.max(parseInt(params.get("maxMessages") || "6", 10), 3), 12);
  // Research: auto-hide after 45-60 seconds keeps screen clean
  const fadeSeconds = Math.min(Math.max(parseInt(params.get("fade") || "45", 10), 0), 120);
  // Fixed panel frame — the box never resizes with message count
  const panelHeight = Math.min(Math.max(parseInt(params.get("height") || "460", 10), 200), 1080);
  // Anchor: content alignment inside the feed (rail + text side). The panel
  // itself is centered in the browser source — streamers size the source to
  // the widget and place it anywhere in OBS/Streamlabs.
  const anchor = (params.get("align") ?? theme.align ?? "left").toLowerCase();
  const alignRight = anchor === "right";

  const events = useMemo(() => {
    if (!theme.eventLines || !alerts?.length) return [];
    return alerts
      .map((a) => alertToEvent(a as StreamAlert))
      .filter((e): e is ChatEvent => e !== null);
  }, [alerts, theme.eventLines]);

  // Chat messages and stream events merged into one chronological feed
  const feedItems = useMemo(() => {
    type Item =
      | { kind: "chat"; ts: number; msg: ChatMessage }
      | { kind: "event"; ts: number; event: ChatEvent };
    const items: Item[] = [];
    for (const msg of messages.slice(-maxMessages)) {
      items.push({ kind: "chat", ts: (msg as ChatMessage).timestamp, msg: msg as ChatMessage });
    }
    for (const event of events) {
      items.push({ kind: "event", ts: event.timestamp, event });
    }
    return items.sort((a, b) => a.ts - b.ts).slice(-(maxMessages + events.length));
  }, [messages, events, maxMessages]);

  const feed = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: theme.messageGap ?? 10,
        height: "100%",
        overflow: "hidden",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 28px)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 28px)",
      }}
    >
      <AnimatePresence initial={false}>
        {feedItems.map((item) => (
          <motion.div
            layout
            key={
              item.kind === "event"
                ? `e-${item.event.timestamp}-${item.event.username}`
                : `m-${item.msg.timestamp}-${item.msg.username}`
            }
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ flexShrink: 0 }}
          >
            {item.kind === "event" ? (
              <EventLine
                event={item.event}
                theme={theme}
                alignRight={alignRight}
                fadeSeconds={fadeSeconds}
              />
            ) : (
              <ChatMessageRow
                message={item.msg}
                theme={theme}
                fadeSeconds={fadeSeconds}
                alignRight={alignRight}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  // The widget is centered in the browser source; size the source to the
  // widget in OBS and place it wherever you want on the canvas.
  if (!theme.panelBg) {
    // Panel disabled — transparent mode, text and decoration only
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 340,
            height: Math.round(panelHeight * 0.9),
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: alignRight ? "flex-end" : "flex-start",
            fontFamily: theme.font,
          }}
        >
          {feed}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 400,
          height: panelHeight,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            background: theme.panelBg,
            borderRadius: theme.panelRadius ?? 28,
            padding: theme.panelPadding ?? "22px 20px",
            border: theme.panelBorder,
            backdropFilter: theme.panelBg ? "blur(16px)" : undefined,
            WebkitBackdropFilter: theme.panelBg ? "blur(16px)" : undefined,
            boxShadow: theme.panelBg
              ? "0 12px 40px rgba(20, 16, 60, 0.25)"
              : undefined,
            fontFamily: theme.font,
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {feed}
        </div>
      </div>
    </div>
  );
}
