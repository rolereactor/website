export interface PlatformFeature {
  label: string;
  description: string;
  available: boolean;
}

export interface PlatformAlertType {
  id: string;
  label: string;
  description: string;
  available: boolean;
}

export interface PlatformConfig {
  id: string;
  name: string;
  implemented: boolean;
  features: {
    alerts: PlatformAlertType[];
    commands: PlatformFeature;
    timers: PlatformFeature;
    chatFilters: PlatformFeature;
    chatReception: PlatformFeature;
    chatSend: PlatformFeature;
    moderation: PlatformFeature;
    autoMessages: PlatformFeature;
    quotes: PlatformFeature;
    polls: PlatformFeature;
  };
}

export const PLATFORM_REGISTRY: Record<string, PlatformConfig> = {
  twitch: {
    id: "twitch",
    name: "Twitch",
    implemented: true,
    features: {
      alerts: [
        { id: "goLive", label: "Go Live", description: "When stream starts", available: true },
        { id: "offline", label: "Offline", description: "When stream ends", available: true },
        { id: "follow", label: "New Follow", description: "New follower", available: true },
        { id: "subscribe", label: "New Sub", description: "New subscriber", available: true },
        { id: "giftSub", label: "Gift Sub", description: "Gift subscription", available: true },
        { id: "raid", label: "Raid", description: "Incoming raid", available: true },
        { id: "resub", label: "Resub", description: "Resubscription message", available: true },
      ],
      commands: { label: "Chat Commands", description: "!commands, !uptime, !title, custom commands", available: true },
      timers: { label: "Auto-Messages", description: "Periodic messages when live", available: true },
      chatFilters: { label: "Chat Filters", description: "Caps, links, spam, bad words", available: true },
      chatReception: { label: "Chat Reception", description: "Real-time via EventSub WebSocket", available: true },
      chatSend: { label: "Chat Sending", description: "Send as bot account via Helix", available: true },
      moderation: { label: "Moderation", description: "Timeout, ban via Helix API", available: true },
      autoMessages: { label: "Auto-Messages", description: "Periodic chat messages", available: true },
      quotes: { label: "Quotes", description: "!quote system with DB storage", available: true },
      polls: { label: "Polls", description: "!poll via Twitch Helix Polls API", available: true },
    },
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    implemented: true,
    features: {
      alerts: [
        { id: "goLive", label: "Go Live", description: "When stream starts", available: false },
        { id: "offline", label: "Offline", description: "When stream ends", available: false },
        { id: "follow", label: "New Subscriber", description: "New channel member", available: false },
        { id: "subscribe", label: "New Sub", description: "New membership", available: false },
        { id: "giftSub", label: "Gift Sub", description: "Membership gift", available: false },
        { id: "raid", label: "Raid", description: "Not supported on YouTube", available: false },
        { id: "resub", label: "Resub", description: "Not supported on YouTube", available: false },
        { id: "superChat", label: "Super Chat", description: "Super Chat message", available: true },
        { id: "superSticker", label: "Super Sticker", description: "Super Sticker", available: true },
      ],
      commands: { label: "Chat Commands", description: "Not yet implemented", available: false },
      timers: { label: "Auto-Messages", description: "Not yet implemented", available: false },
      chatFilters: { label: "Chat Filters", description: "Not yet implemented", available: false },
      chatReception: { label: "Chat Reception", description: "Polling-based (5s intervals)", available: true },
      chatSend: { label: "Chat Sending", description: "Live Chat API", available: true },
      moderation: { label: "Moderation", description: "Not yet implemented", available: false },
      autoMessages: { label: "Auto-Messages", description: "Not yet implemented", available: false },
      quotes: { label: "Quotes", description: "Not yet implemented", available: false },
      polls: { label: "Polls", description: "Not yet implemented", available: false },
    },
  },
  kick: {
    id: "kick",
    name: "Kick",
    implemented: false,
    features: {
      alerts: [
        { id: "goLive", label: "Go Live", description: "When stream starts", available: false },
        { id: "offline", label: "Offline", description: "When stream ends", available: false },
        { id: "follow", label: "New Follow", description: "New follower", available: false },
        { id: "subscribe", label: "New Sub", description: "New subscriber", available: false },
        { id: "giftSub", label: "Gift Sub", description: "Gift subscription", available: false },
        { id: "raid", label: "Raid", description: "Incoming raid", available: false },
        { id: "resub", label: "Resub", description: "Resubscription message", available: false },
      ],
      commands: { label: "Chat Commands", description: "Not yet implemented", available: false },
      timers: { label: "Auto-Messages", description: "Not yet implemented", available: false },
      chatFilters: { label: "Chat Filters", description: "Not yet implemented", available: false },
      chatReception: { label: "Chat Reception", description: "Not yet implemented", available: false },
      chatSend: { label: "Chat Sending", description: "Not yet implemented", available: false },
      moderation: { label: "Moderation", description: "Not yet implemented", available: false },
      autoMessages: { label: "Auto-Messages", description: "Not yet implemented", available: false },
      quotes: { label: "Quotes", description: "Not yet implemented", available: false },
      polls: { label: "Polls", description: "Not yet implemented", available: false },
    },
  },
};

export function getPlatformFeatures(platformId: string): PlatformConfig | null {
  return PLATFORM_REGISTRY[platformId] || null;
}

export function getAvailableAlertTypes(platformId: string): PlatformAlertType[] {
  const platform = PLATFORM_REGISTRY[platformId];
  if (!platform) return [];
  return platform.features.alerts;
}

export function isFeatureAvailable(platformId: string, feature: keyof PlatformConfig["features"]): boolean {
  const platform = PLATFORM_REGISTRY[platformId];
  if (!platform) return false;
  const f = platform.features[feature];
  if (Array.isArray(f)) return f.some(a => a.available);
  return f.available;
}
