"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSSE } from "@/hooks/use-sse";

import { AlertWidget } from "./_components/alert-widget";
import { ChatWidget } from "./_components/chat-widget";
import { ActivityWidget } from "./_components/activity-widget";
import {
  THEME_PRESETS,
  loadOverlayTheme,
  onOverlayThemeChange,
  type OverlayTheme,
} from "./_components/theme";

interface OverlayPageProps {
  params: Promise<{ guildId: string; widget: string }>;
}

const svgBadge = (fill: string, path: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${fill}" d="${path}"/></svg>`
  )}`;

const _BADGE_GOLD_STAR = svgBadge(
  "#ffd700",
  "M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.5l7.1-.6z"
);
const BADGE_GEM = svgBadge(
  "#c084fc",
  "M12 2 L21 9 L12 22 L3 9 Z M5.5 9 L12 5 L18.5 9 M8 9 L12 15 L16 9"
);

/** One message per role so every role style is visible (demo=all) */
const DEMO_ROLE_MESSAGES = [
  { username: "StreamHost", message: "welcome to the stream everyone!", isBroadcaster: true, platform: "twitch" },
  { username: "ModMaven", message: "Chat, keep it cozy in here ⚔", isMod: true, platform: "twitch" },
  { username: "CrystalVIP", message: "first time catching the stream live", isVip: true, platform: "twitch", badges: [BADGE_GEM] },
  { username: "wren99", message: "been here since day one", isOg: true, platform: "kick" },
  { username: "SubStar", message: "hey everyone, loving the vibe", isSubscriber: true, platform: "youtube" },
  { username: "FreshFace", message: "how long have you been streaming today?", platform: "youtube" },
];

/** Every alert type in order (demo=all) */
const DEMO_ALL_EVENTS = [
  { type: "goLive", username: "StreamHost" },
  { type: "follow", username: "QuietFrog" },
  { type: "subscribe", username: "Bits4Days" },
  { type: "giftSub", username: "Milaeshop", total: 5 },
  { type: "resub", username: "Mila", cumulativeMonths: 10 },
  { type: "raid", username: "StudioStream", viewers: 128 },
  { type: "superChat", username: "CrystalVIP", amount: 50 },
  { type: "superSticker", username: "NightOwl", amount: 20 },
  { type: "offline", username: "StreamHost" },
];

const DEMO_MESSAGES = [
  { username: "PixPirate", message: "That boss fight was clean!", isBroadcaster: false, isMod: false, isSubscriber: false, isVip: false, platform: "twitch" },
  { username: "ModMaven", message: "Chat, keep it cozy in here ⚔", isMod: true, platform: "twitch" },
  { username: "SubStar", message: "hey @ModMaven, loving the vibe", isSubscriber: true, platform: "twitch" },
  { username: "CrystalVIP", message: "first time catching the stream live", isVip: true, platform: "twitch" },
  { username: "FreshFace", message: "how long have you been streaming today?", platform: "twitch" },
  { username: "NightOwl", message: "the new overlay looks so good", isSubscriber: true, platform: "youtube" },
  { username: "RaidLeader", message: "raiding her channel next, get ready", isOg: true, platform: "kick" },
  { username: "Bits4Days", message: "LETS GOOO 🔥", isVip: true, platform: "twitch" },
  { username: "QuietFrog", message: "just found the stream, instant follow", platform: "youtube" },
  { username: "ModMaven", message: "welcome in QuietFrog 👋", isMod: true, platform: "twitch" },
];

const DEMO_ALERTS = [
  { type: "resub", username: "Mila", cumulativeMonths: 10 },
  { type: "giftSub", username: "Milaeshop", total: 5 },
  { type: "subscribe", username: "Bits4Days" },
  { type: "raid", username: "StudioStream", viewers: 128 },
  { type: "follow", username: "QuietFrog" },
  { type: "superChat", username: "CrystalVIP", amount: 50 },
];

export default function OverlayPage({ params }: OverlayPageProps) {
  const { guildId, widget } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [theme, setTheme] = useState<OverlayTheme | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [lastAlert, setLastAlert] = useState<unknown>(null);
  const [chatMessages, setChatMessages] = useState<unknown[]>([]);
  const [chatAlerts, setChatAlerts] = useState<unknown[]>([]);
  const [activityItems, setActivityItems] = useState<unknown[]>([]);

  const demoParam = searchParams.get("demo");
  const isDemo = demoParam === "true" || demoParam === "all";
  const isDemoAll = demoParam === "all";

  // Demo messages never fade out (unless fade is set explicitly) — otherwise
  // background-tab timer throttling drains the panel to empty.
  const widgetParams = useMemo(() => {
    const p = new URLSearchParams(searchParams);
    if (isDemo && !p.get("fade")) p.set("fade", "0");
    return p;
  }, [searchParams, isDemo]);

  useEffect(() => {
    if (!token) {
      setVerified(false);
      return;
    }

    fetch(`/overlay/verify/${guildId}/${widget}?token=${token}`)
      .then(res => {
        setVerified(res.ok);
        if (res.ok) {
          // ?theme=<presetName> overrides the dashboard-saved theme
          const presetName = searchParams.get("theme");
          const preset = presetName ? THEME_PRESETS[presetName] : undefined;
          setTheme(preset ?? loadOverlayTheme(guildId, widget));
        }
      })
      .catch(() => setVerified(false));
  }, [guildId, widget, token, searchParams]);

  // Live theme sync: when the dashboard saves an overlay theme (same origin,
  // other tab), hot-apply it — no new URL or reload needed.
  useEffect(() => {
    if (verified !== true) return;
    return onOverlayThemeChange(() => {
      const presetName = searchParams.get("theme");
      const preset = presetName ? THEME_PRESETS[presetName] : undefined;
      setTheme(preset ?? loadOverlayTheme(guildId, widget));
    });
  }, [verified, guildId, widget, searchParams]);

  // Demo mode: simulate live chat so animations (slide-in, fade-out, event
  // lines) can be previewed in OBS without real chat traffic.
  //   &demo=true — randomized live simulation (message every 5s, event every ~20s)
  //   &demo=all  — showcase: one message per role, then every event type in order
  useEffect(() => {
    if (verified !== true || !isDemo || widget !== "chat") return;

    const now = Date.now();
    const seed = isDemoAll ? DEMO_ROLE_MESSAGES : DEMO_MESSAGES.slice(0, 3);
    setChatMessages(
      seed.map((m, i) => ({
        ...m,
        timestamp: now - (seed.length - i) * 30000,
      }))
    );
    setChatAlerts(
      isDemoAll
        ? []
        : [{ ...DEMO_ALERTS[0], timestamp: now - 20000 }]
    );

    let msgIndex = isDemoAll ? 0 : 3;
    let alertIndex = isDemoAll ? 0 : 1;
    const interval = setInterval(() => {
      const ts = Date.now();
      // showcase: alternate one event and one chat message so both animate
      if (isDemoAll && alertIndex < DEMO_ALL_EVENTS.length) {
        setChatAlerts(prev => [
          ...prev.slice(-19),
          { ...DEMO_ALL_EVENTS[alertIndex], timestamp: ts },
        ]);
        alertIndex += 1;
      } else {
        const pool = isDemoAll ? DEMO_ROLE_MESSAGES : DEMO_MESSAGES;
        setChatMessages(prev => [
          ...prev.slice(-19),
          { ...pool[msgIndex % pool.length], timestamp: ts },
        ]);
        msgIndex += 1;
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [verified, isDemo, widget]);

  const { isConnected: _isConnected } = useSSE(verified ? guildId : null, (eventType, data) => {
    switch (eventType) {
      case "stream.alert":
        setLastAlert(data);
        setChatAlerts(prev => [...prev.slice(-19), data]);
        break;
      case "stream.chat":
        setChatMessages(prev => [...prev.slice(-49), data]);
        break;
      case "activity":
        setActivityItems(prev => [...prev.slice(-49), data]);
        break;
    }
  }, token ? { buildUrl: (id: string) => `/api/stream/${id}/events?token=${token}` } : undefined);

  if (verified === null) {
    return null;
  }

  if (!verified) {
    return (
      <div style={{
        background: "#1a1a2e",
        color: "#fff",
        fontFamily: "sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        margin: 0,
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, opacity: 0.7 }}>Invalid or expired overlay link</p>
          <p style={{ fontSize: 14, opacity: 0.5, marginTop: 8 }}>Generate a new URL from the dashboard</p>
        </div>
      </div>
    );
  }

  const t: OverlayTheme = theme || { bg: "rgba(0,0,0,0.6)", text: "#ffffff", accent: "#9146ff", font: "sans-serif", radius: 8, fontSize: 14 };

  const ambientBg = t.bgImage ? (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundImage: `url(${t.bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: `blur(${t.bgBlur || 40}px)`,
      transform: "scale(1.1)",
      zIndex: -1,
    }} />
  ) : null;

  const renderWidget = () => {
    switch (widget) {
      case "alerts":
        return <AlertWidget alert={lastAlert} theme={t} params={widgetParams} />;
      case "chat":
        return <ChatWidget messages={chatMessages} theme={t} params={widgetParams} alerts={chatAlerts} />;
      case "activity":
        return <ActivityWidget items={activityItems} theme={t} params={widgetParams} />;
      default:
        return null;
    }
  };

  return (
    <>
      {ambientBg}
      {renderWidget()}
    </>
  );
}
