"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Zap } from "lucide-react";
import type { OverlayTheme } from "./theme";

interface AlertData {
  type: string;
  username: string;
  message?: string;
  tier?: string;
  viewers?: number;
  cumulativeMonths?: number;
  total?: number;
  amount?: number;
  timestamp: number;
}

const LABELS: Record<string, string> = {
  goLive: "NOW LIVE",
  follow: "NEW FOLLOWER",
  subscribe: "NEW SUBSCRIBER",
  giftSub: "GIFT SUB",
  raid: "RAID",
  resub: "RESUB",
  offline: "STREAM OFFLINE",
  superChat: "SUPER CHAT",
  superSticker: "SUPER STICKER",
};

const TYPE_COLORS: Record<string, string> = {
  goLive: "#00ff88",
  follow: "#9146ff",
  subscribe: "#9146ff",
  giftSub: "#ffd700",
  raid: "#ff4444",
  resub: "#ff69b4",
  offline: "#888888",
  superChat: "#ffd700",
  superSticker: "#ffd700",
};

interface AlertWidgetProps {
  alert: unknown;
  theme: OverlayTheme;
  params: URLSearchParams;
}

export function AlertWidget({ alert, theme, params }: AlertWidgetProps) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<AlertData | null>(null);
  const queueRef = useRef<AlertData[]>([]);
  const playingRef = useRef(false);
  // Research: 5-8 seconds optimal for alerts
  const duration = Math.min(Math.max(parseInt(params.get("duration") || "5000", 10), 2000), 10000);

  const drain = useCallback(async () => {
    if (playingRef.current || queueRef.current.length === 0) return;
    playingRef.current = true;

    const next = queueRef.current.shift()!;
    setCurrent(next);
    setVisible(true);

    if (params.get("sound") !== "false") {
      try {
        new Audio("/sounds/alert.mp3").play();
      } catch { /* ignore */ }
    }

    await new Promise(r => setTimeout(r, duration));
    setVisible(false);
    // Research: subtle fade-out, no abrupt cutoff
    await new Promise(r => setTimeout(r, 400));

    playingRef.current = false;
    drain();
  }, [duration, params]);

  useEffect(() => {
    if (!alert) return;
    queueRef.current.push(alert as AlertData);
    drain();
  }, [alert, drain]);

  const type = current?.type || "follow";
  const color = TYPE_COLORS[type] || theme.accent;

  return (
    <>
      <style>{`
        @keyframes alertSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes alertSlideOut {
          to { opacity: 0; transform: translateY(-10px) scale(0.98); }
        }
      `}</style>
      {/* Centered in the browser source — size the source to the widget and
          place it anywhere in OBS/Streamlabs (top-center keeps it clear of
          the face/HUD by default placement) */}
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
          <div style={{
            background: theme.messageBg ?? theme.bg,
            borderRadius: theme.messageRadius ?? theme.radius,
            padding: theme.messagePadding ?? "16px 28px",
            color: theme.textColor ?? theme.text,
            textAlign: "center",
            minWidth: 280,
            maxWidth: 450,
            fontFamily: theme.font,
            fontSize: theme.fontSize,
            fontWeight: theme.fontWeight ?? 400,
            lineHeight: theme.lineHeight ?? 1.5,
            letterSpacing: theme.letterSpacing ?? 0,
            textShadow: theme.textShadow ?? "none",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(-20px) scale(0.95)",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            // Research: subtle shadow for depth, not heavy
            boxShadow: "0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.1)",
            pointerEvents: "auto",
          }}>
            {/* Avatar-style event icon — matches modern alert designs */}
            <div
              style={{
                margin: "0 auto 10px",
                width: 44,
                height: 44,
                borderRadius: "9999px",
                background: `linear-gradient(135deg, ${color}, ${color}55)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 24px ${color}55`,
              }}
            >
              <Zap size={20} color="#ffffff" />
            </div>
            <div style={{
              fontSize: Math.max(theme.fontSize - 4, 11),
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 2,
              color,
              marginBottom: 6,
            }}>
              {LABELS[type] || type.toUpperCase()}
            </div>
            <div style={{
              fontSize: theme.fontSize + 6,
              fontWeight: theme.usernameWeight ?? 800,
              marginBottom: 4,
            }}>
              {current?.username}
            </div>
            {current?.amount !== undefined && (
              <div style={{
                fontSize: Math.max(theme.fontSize - 2, 12),
                fontWeight: 700,
                color,
                marginTop: 4,
              }}>
                ${current.amount}
              </div>
            )}
            {current?.message && (
              <div style={{
                fontSize: Math.max(theme.fontSize - 4, 12),
                opacity: 0.8,
                marginTop: 4,
              }}>
                {current.message}
              </div>
            )}
            {current?.viewers && (
              <div style={{
                fontSize: Math.max(theme.fontSize - 6, 11),
                opacity: 0.6,
                marginTop: 4,
              }}>
                {current.viewers} viewers
              </div>
            )}
            {current?.cumulativeMonths && (
              <div style={{
                fontSize: Math.max(theme.fontSize - 6, 11),
                opacity: 0.6,
                marginTop: 4,
              }}>
                {current.cumulativeMonths} months
              </div>
            )}
          </div>
        </div>
    </>
  );
}
