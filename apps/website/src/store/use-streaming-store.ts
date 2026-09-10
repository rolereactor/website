import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StreamConnection {
  platform: string;
  platformLogin: string;
  isConnected: boolean;
  eventSubConnected: boolean;
  alertsEnabled: boolean;
  alertChannelId: string | null;
  commandsEnabled: boolean;
  commandPrefix: string;
  // Live stream status (optional — degrades gracefully if not returned by backend)
  isLive?: boolean;
  streamTitle?: string;
  gameName?: string;
  viewerCount?: number;
  startedAt?: string; // ISO date string
}

export interface StreamConfig {
  alertsEnabled: boolean;
  alertChannelId: string | null;
  commandsEnabled: boolean;
  commandPrefix: string;
  alertTypes: {
    goLive: boolean;
    offline: boolean;
    follow: boolean;
    subscribe: boolean;
    giftSub: boolean;
    raid: boolean;
    resub: boolean;
    [key: string]: boolean;
  };
}

export interface TwitchCommand {
  name: string;
  description: string;
  userlevel: string;
  response: string | null;
  enabled: boolean;
  isBuiltIn: boolean;
}

export interface ChatFilters {
  enabled: boolean;
  caps?: { enabled: boolean; threshold?: number; minLength?: number };
  links?: { enabled: boolean };
  spam?: {
    enabled: boolean;
    repeatedMessages?: number;
    rateThreshold?: number;
  };
  badWords?: { enabled: boolean; words?: string[] };
  timeoutDuration?: number;
}

export interface TwitchQuote {
  id: number;
  text: string;
  addedBy?: string;
  createdAt?: string;
}

export interface TwitchTimer {
  name: string;
  message: string;
  intervalMs: number;
  enabled: boolean;
  lastSentAt?: string;
}

export interface BotAccountStatus {
  connected: boolean;
  source?: string;
  login?: string;
  botUserId?: string;
}

export interface Diagnostics {
  connections: StreamConnection[];
  botAccount: BotAccountStatus;
  eventSub: { sessions: number; ready: number };
  lastChatAt: number | null;
  lastCommandReplyAt: number | null;
}

// ─── State ──────────────────────────────────────────────────────────────────

interface PlatformAvailability {
  enabled: boolean;
}

interface StreamingState {
  // Per-guild caches
  statusCache: Record<string, StreamConnection[]>;
  configCache: Record<string, StreamConfig>;
  commandsCache: Record<string, TwitchCommand[]>;
  filtersCache: Record<string, ChatFilters>;
  quotesCache: Record<string, TwitchQuote[]>;
  timersCache: Record<string, TwitchTimer[]>;
  diagCache: Record<string, Diagnostics>;

  // Platform availability (from bot config)
  platforms: Record<string, PlatformAvailability>;

  // Loading/error
  isLoading: Record<string, boolean>;
  isError: Record<string, Error | null>;
  lastFetched: Record<string, number>;

  // Actions
  fetchStatus: (guildId: string, force?: boolean) => Promise<void>;
  fetchConfig: (guildId: string, force?: boolean) => Promise<void>;
  fetchCommands: (guildId: string, force?: boolean) => Promise<void>;
  fetchFilters: (guildId: string, force?: boolean) => Promise<void>;
  fetchQuotes: (guildId: string, force?: boolean) => Promise<void>;
  fetchTimers: (guildId: string, force?: boolean) => Promise<void>;
  fetchDiag: (guildId: string, force?: boolean) => Promise<void>;

  updateConfig: (
    guildId: string,
    config: Partial<StreamConfig>
  ) => Promise<void>;
  connect: (guildId: string, platform?: string) => Promise<string>;
  disconnect: (guildId: string, platform?: string) => Promise<void>;
  testAlert: (guildId: string, type: string) => Promise<void>;

  addCommand: (
    guildId: string,
    cmd: {
      name: string;
      response: string;
      description?: string;
      userlevel?: string;
    }
  ) => Promise<void>;
  editCommand: (
    guildId: string,
    name: string,
    updates: Partial<TwitchCommand>
  ) => Promise<void>;
  deleteCommand: (guildId: string, name: string) => Promise<void>;

  updateFilter: (
    guildId: string,
    filter: string,
    updates: Record<string, unknown>
  ) => Promise<void>;

  addQuote: (guildId: string, text: string) => Promise<void>;
  deleteQuote: (guildId: string, id: number) => Promise<void>;

  addTimer: (
    guildId: string,
    name: string,
    message: string,
    interval: number
  ) => Promise<void>;
  deleteTimer: (guildId: string, name: string) => Promise<void>;

  clearCache: (guildId?: string) => void;
}

const CACHE_DURATION = 5 * 60 * 1000;

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const text = await res.text();
  let data: Record<string, unknown> | null = null;

  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    data = null;
  }

  if (!res.ok || (data && (data.status === "error" || data.success === false))) {
    const errorMsg =
      (data?.error as string) || (data?.message as string) || `Request failed (${res.status})`;
    throw new Error(errorMsg);
  }

  if (!data) {
    throw new Error(`Invalid JSON response from server (${res.status})`);
  }

  return data as T;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useStreamingStore = create<StreamingState>()(
  persist(
    (set, get) => ({
      statusCache: {},
      configCache: {},
      commandsCache: {},
      filtersCache: {},
      quotesCache: {},
      timersCache: {},
      diagCache: {},
      platforms: {},
      isLoading: {},
      isError: {},
      lastFetched: {},

      fetchStatus: async (guildId, force = false) => {
        const now = Date.now();
        const last = get().lastFetched[`status:${guildId}`] || 0;
        if (!force && get().statusCache[guildId] && now - last < CACHE_DURATION)
          return;

        set({ isLoading: { ...get().isLoading, [`status:${guildId}`]: true } });
        try {
          const data = await apiFetch<{
            connections: StreamConnection[];
            platforms: Record<string, PlatformAvailability>;
          }>(
            `/api/stream/${guildId}/status`
          );
          set({
            statusCache: { ...get().statusCache, [guildId]: data.connections },
            platforms: data.platforms || get().platforms,
            lastFetched: {
              ...get().lastFetched,
              [`status:${guildId}`]: Date.now(),
            },
            isLoading: { ...get().isLoading, [`status:${guildId}`]: false },
            isError: { ...get().isError, [`status:${guildId}`]: null },
          });
        } catch (e) {
          set({
            isError: {
              ...get().isError,
              [`status:${guildId}`]:
                e instanceof Error ? e : new Error(String(e)),
            },
            isLoading: { ...get().isLoading, [`status:${guildId}`]: false },
          });
        }
      },

      fetchConfig: async (guildId, force = false) => {
        const now = Date.now();
        const last = get().lastFetched[`config:${guildId}`] || 0;
        if (!force && get().configCache[guildId] && now - last < CACHE_DURATION)
          return;

        set({ isLoading: { ...get().isLoading, [`config:${guildId}`]: true } });
        try {
          const data = await apiFetch<{ config: StreamConfig }>(
            `/api/stream/${guildId}/config`
          );
          set({
            configCache: { ...get().configCache, [guildId]: data.config },
            lastFetched: {
              ...get().lastFetched,
              [`config:${guildId}`]: Date.now(),
            },
            isLoading: { ...get().isLoading, [`config:${guildId}`]: false },
          });
        } catch (e) {
          set({
            isError: {
              ...get().isError,
              [`config:${guildId}`]:
                e instanceof Error ? e : new Error(String(e)),
            },
            isLoading: { ...get().isLoading, [`config:${guildId}`]: false },
          });
        }
      },

      fetchCommands: async (guildId, force = false) => {
        const now = Date.now();
        const last = get().lastFetched[`commands:${guildId}`] || 0;
        if (
          !force &&
          get().commandsCache[guildId] &&
          now - last < CACHE_DURATION
        )
          return;

        set({
          isLoading: { ...get().isLoading, [`commands:${guildId}`]: true },
        });
        try {
          const data = await apiFetch<{ commands: TwitchCommand[] }>(
            `/api/stream/${guildId}/commands`
          );
          set({
            commandsCache: { ...get().commandsCache, [guildId]: data.commands },
            lastFetched: {
              ...get().lastFetched,
              [`commands:${guildId}`]: Date.now(),
            },
            isLoading: { ...get().isLoading, [`commands:${guildId}`]: false },
          });
        } catch (e) {
          set({
            isError: {
              ...get().isError,
              [`commands:${guildId}`]:
                e instanceof Error ? e : new Error(String(e)),
            },
            isLoading: { ...get().isLoading, [`commands:${guildId}`]: false },
          });
        }
      },

      fetchFilters: async (guildId, force = false) => {
        const now = Date.now();
        const last = get().lastFetched[`filters:${guildId}`] || 0;
        if (
          !force &&
          get().filtersCache[guildId] &&
          now - last < CACHE_DURATION
        )
          return;

        set({
          isLoading: { ...get().isLoading, [`filters:${guildId}`]: true },
        });
        try {
          const data = await apiFetch<{ filters: ChatFilters }>(
            `/api/stream/${guildId}/filters`
          );
          set({
            filtersCache: { ...get().filtersCache, [guildId]: data.filters },
            lastFetched: {
              ...get().lastFetched,
              [`filters:${guildId}`]: Date.now(),
            },
            isLoading: { ...get().isLoading, [`filters:${guildId}`]: false },
          });
        } catch (e) {
          set({
            isError: {
              ...get().isError,
              [`filters:${guildId}`]:
                e instanceof Error ? e : new Error(String(e)),
            },
            isLoading: { ...get().isLoading, [`filters:${guildId}`]: false },
          });
        }
      },

      fetchQuotes: async (guildId, force = false) => {
        const now = Date.now();
        const last = get().lastFetched[`quotes:${guildId}`] || 0;
        if (!force && get().quotesCache[guildId] && now - last < CACHE_DURATION)
          return;

        set({ isLoading: { ...get().isLoading, [`quotes:${guildId}`]: true } });
        try {
          const data = await apiFetch<{ quotes: TwitchQuote[] }>(
            `/api/stream/${guildId}/quotes`
          );
          set({
            quotesCache: { ...get().quotesCache, [guildId]: data.quotes },
            lastFetched: {
              ...get().lastFetched,
              [`quotes:${guildId}`]: Date.now(),
            },
            isLoading: { ...get().isLoading, [`quotes:${guildId}`]: false },
          });
        } catch (e) {
          set({
            isError: {
              ...get().isError,
              [`quotes:${guildId}`]:
                e instanceof Error ? e : new Error(String(e)),
            },
            isLoading: { ...get().isLoading, [`quotes:${guildId}`]: false },
          });
        }
      },

      fetchTimers: async (guildId, force = false) => {
        const now = Date.now();
        const last = get().lastFetched[`timers:${guildId}`] || 0;
        if (!force && get().timersCache[guildId] && now - last < CACHE_DURATION)
          return;

        set({ isLoading: { ...get().isLoading, [`timers:${guildId}`]: true } });
        try {
          const data = await apiFetch<{ timers: TwitchTimer[] }>(
            `/api/stream/${guildId}/timers`
          );
          set({
            timersCache: { ...get().timersCache, [guildId]: data.timers },
            lastFetched: {
              ...get().lastFetched,
              [`timers:${guildId}`]: Date.now(),
            },
            isLoading: { ...get().isLoading, [`timers:${guildId}`]: false },
          });
        } catch (e) {
          set({
            isError: {
              ...get().isError,
              [`timers:${guildId}`]:
                e instanceof Error ? e : new Error(String(e)),
            },
            isLoading: { ...get().isLoading, [`timers:${guildId}`]: false },
          });
        }
      },

      fetchDiag: async (guildId, force = false) => {
        const now = Date.now();
        const last = get().lastFetched[`diag:${guildId}`] || 0;
        if (!force && get().diagCache[guildId] && now - last < CACHE_DURATION)
          return;

        set({ isLoading: { ...get().isLoading, [`diag:${guildId}`]: true } });
        try {
          const data = await apiFetch<{ data: Diagnostics }>(
            `/api/stream/${guildId}/diag`
          );
          set({
            diagCache: {
              ...get().diagCache,
              [guildId]: data.data ?? (data as unknown as Diagnostics),
            },
            lastFetched: {
              ...get().lastFetched,
              [`diag:${guildId}`]: Date.now(),
            },
            isLoading: { ...get().isLoading, [`diag:${guildId}`]: false },
          });
        } catch (e) {
          set({
            isError: {
              ...get().isError,
              [`diag:${guildId}`]:
                e instanceof Error ? e : new Error(String(e)),
            },
            isLoading: { ...get().isLoading, [`diag:${guildId}`]: false },
          });
        }
      },

      updateConfig: async (guildId, config) => {
        await fetch(`/api/stream/${guildId}/config`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        });
        await get().fetchConfig(guildId, true);
      },

      connect: async (guildId, platform = "twitch") => {
        const data = await apiFetch<{ url: string }>(
          `/api/stream/${guildId}/connect?platform=${platform}`,
          { method: "POST" }
        );
        return data.url;
      },

      disconnect: async (guildId, platform = "twitch") => {
        const res = await fetch(
          `/api/stream/${guildId}/disconnect?platform=${platform}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(
            (data?.error as string) || `Disconnect failed (${res.status})`
          );
        }
        await get().fetchStatus(guildId, true);
      },

      testAlert: async (guildId, type) => {
        await fetch(`/api/stream/${guildId}/alert-test`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
      },

      addCommand: async (guildId, cmd) => {
        await fetch(`/api/stream/${guildId}/commands`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cmd),
        });
        await get().fetchCommands(guildId, true);
      },

      editCommand: async (guildId, name, updates) => {
        await fetch(
          `/api/stream/${guildId}/commands/${encodeURIComponent(name)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          }
        );
        await get().fetchCommands(guildId, true);
      },

      deleteCommand: async (guildId, name) => {
        await fetch(
          `/api/stream/${guildId}/commands/${encodeURIComponent(name)}`,
          { method: "DELETE" }
        );
        await get().fetchCommands(guildId, true);
      },

      updateFilter: async (guildId, filter, updates) => {
        await fetch(`/api/stream/${guildId}/filters/${filter}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        await get().fetchFilters(guildId, true);
      },

      addQuote: async (guildId, text) => {
        await fetch(`/api/stream/${guildId}/quotes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        await get().fetchQuotes(guildId, true);
      },

      deleteQuote: async (guildId, id) => {
        await fetch(`/api/stream/${guildId}/quotes/${id}`, {
          method: "DELETE",
        });
        await get().fetchQuotes(guildId, true);
      },

      addTimer: async (guildId, name, message, interval) => {
        await fetch(`/api/stream/${guildId}/timers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, message, interval }),
        });
        await get().fetchTimers(guildId, true);
      },

      deleteTimer: async (guildId, name) => {
        await fetch(
          `/api/stream/${guildId}/timers/${encodeURIComponent(name)}`,
          { method: "DELETE" }
        );
        await get().fetchTimers(guildId, true);
      },

      clearCache: (guildId) => {
        if (guildId) {
          const s = get();
          function removeKey<T>(cache: Record<string, T>): Record<string, T> {
            const next = { ...cache };
            delete next[guildId as string];
            return next;
          }
          set({
            statusCache: removeKey(s.statusCache),
            configCache: removeKey(s.configCache),
            commandsCache: removeKey(s.commandsCache),
            filtersCache: removeKey(s.filtersCache),
            quotesCache: removeKey(s.quotesCache),
            timersCache: removeKey(s.timersCache),
            diagCache: removeKey(s.diagCache),
          });
        } else {
          set({
            statusCache: {},
            configCache: {},
            commandsCache: {},
            filtersCache: {},
            quotesCache: {},
            timersCache: {},
            diagCache: {},
            lastFetched: {},
          });
        }
      },
    }),
    {
      name: "live-reactor-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        configCache: state.configCache,
      }),
    }
  )
);
