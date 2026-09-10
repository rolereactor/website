"use client";

import { useEffect, useRef } from "react";
import type { OverlayTheme } from "./theme";

interface ActivityItem {
  type: string;
  username: string;
  details?: string;
  timestamp: number;
}

const ICONS: Record<string, string> = {
  member_join: "👋",
  giveaway_enter: "🎁",
  giveaway_win: "🏆",
  ticket_create: "🎫",
  donation: "💰",
};

const BORDER_COLORS: Record<string, string> = {
  member_join: "#00ff88",
  giveaway_enter: "#ffd700",
  giveaway_win: "#ff4444",
  ticket_create: "#9146ff",
  donation: "#ff9944",
};

interface ActivityWidgetProps {
  items: unknown[];
  theme: OverlayTheme;
  params: URLSearchParams;
}

export function ActivityWidget({ items, theme, params }: ActivityWidgetProps) {
  // Research: max 5 visible items
  const maxItems = Math.min(Math.max(parseInt(params.get("maxItems") || "5", 10), 3), 8);
  // Research: auto-hide after 40 seconds keeps screen clean
  const fadeSeconds = Math.min(Math.max(parseInt(params.get("fade") || "40", 10), 0), 120);

  // Centered in the browser source — size the source to the widget and place
  // it anywhere in OBS/Streamlabs (position is the streamer's choice there).
  return (
    <>
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <div style={{
          width: 300,
          display: "flex", flexDirection: "column", gap: 4, overflow: "hidden",
          fontFamily: theme.font,
        }}>
          {items.slice(-maxItems).map((item, i) => (
            <ActivityItemCard key={`${(item as ActivityItem).timestamp}-${i}`} item={item as ActivityItem} theme={theme} fadeSeconds={fadeSeconds} />
          ))}
        </div>
      </div>
    </>
  );
}

function ActivityItemCard({ item, theme, fadeSeconds }: { item: ActivityItem; theme: OverlayTheme; fadeSeconds: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fadeSeconds > 0 && ref.current) {
      const timer = setTimeout(() => {
        if (ref.current) {
          ref.current.style.opacity = "0";
          ref.current.style.transition = "opacity 0.8s ease";
        }
      }, fadeSeconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [fadeSeconds]);

  return (
    <div ref={ref} style={{
      background: theme.messageBg ?? theme.bg,
      borderRadius: theme.messageRadius ?? theme.radius,
      padding: theme.messagePadding ?? "10px 12px",
      marginBottom: theme.messageGap ?? 4,
      color: theme.textColor ?? theme.text,
      fontSize: theme.fontSize,
      fontWeight: theme.fontWeight ?? 400,
      lineHeight: theme.lineHeight ?? 1.4,
      letterSpacing: theme.letterSpacing ?? 0,
      textShadow: theme.textShadow ?? "none",
      // Research: color-coded left border for quick identification
      borderLeft: `3px solid ${BORDER_COLORS[item.type] || theme.accent}`,
      animation: "activitySlideIn 0.25s ease-out",
    }}>
      <style>{`@keyframes activitySlideIn { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }`}</style>
      <span style={{
        marginRight: 6,
        fontSize: Math.max(theme.fontSize, 14),
      }}>{ICONS[item.type] || ""}</span>
      <span style={{ fontWeight: theme.usernameWeight ?? 600 }}>{item.username}</span>
      {item.details && (
        <div style={{
          opacity: 0.7,
          marginTop: 2,
          fontSize: Math.max(theme.fontSize - 2, 11),
        }}>{item.details}</div>
      )}
    </div>
  );
}
