import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Ticket {
  id: string;
  channelId: string;
  guildId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  status: "open" | "closed" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  claimedBy?: string;
  claimedByName?: string;
  messageCount: number;
  participantCount: number;
  participants: string[];
  category?: string;
  tags?: string[];
  createdAt: string;
  closedAt?: string;
  lastActivityAt: string;
  metadata?: Record<string, unknown>;
}

export interface TicketStats {
  openCount: number;
  closedThisMonth: number;
  totalAllTime: number;
  avgCloseTimeMinutes: number;
}

export interface TicketCategory {
  id: string;
  label: string;
  emoji: string;
  description?: string;
  color?: number;
}

export interface TicketCategoryInput {
  id?: string;
  label: string;
  emoji: string;
  description?: string;
  color?: number;
}

export interface TicketPanel {
  panelId: string;
  channelId: string;
  channelName?: string;
  messageId: string;
  enabled: boolean;
  title: string;
  description: string;
  category?: string;
  color?: string;
  icon?: string;
  maxParticipants?: number;
  ticketCount?: number;
  lastUsedAt?: string;
  createdAt: string;
  settings?: { enabled: boolean };
  categories?: TicketCategory[];
}

export interface Transcript {
  _id: string;
  ticketId: string;
  channelId: string;
  guildId: string;
  creatorId: string;
  creatorName: string;
  claimedBy?: string;
  claimedByName?: string;
  messageCount: number;
  participantCount: number;
  category?: string;
  tags?: string[];
  status: string;
  closedAt: string;
  createdAt: string;
  durationMinutes: number;
  messages: Array<{
    author: string;
    authorName: string;
    content: string;
    timestamp: string;
    attachments?: string[];
  }>;
}

export interface TicketSettings {
  staffRoleId?: string;
  staffRoleName?: string;
  transcriptChannelId?: string;
  transcriptChannelName?: string;
  notificationChannelId?: string;
  autoCloseDays?: number;
  maxTicketsPerUser?: number;
  supportCategoryId?: string;
  allowStaffClaim?: boolean;
  allowUserClose?: boolean;
  allowUserTranscripts?: boolean;
  welcomeMessage?: string;
  closeMessage?: string;
  categories?: TicketCategory[];
}

export interface StaffMember {
  staffId: string;
  staffName: string;
  ticketsClosed: number;
  avgCloseTimeMinutes: number;
}

interface GuildTicketData {
  tickets: Ticket[];
  stats: TicketStats | null;
  panels: TicketPanel[];
  transcripts: Transcript[];
  transcriptTotal: number;
  settings: TicketSettings | null;
  staffStats: StaffMember[];
  total: number;
  page: number;
  hasMore: boolean;
}

interface TicketState {
  dataCache: Record<string, GuildTicketData>;
  isLoading: boolean;
  isError: Error | null;
  lastFetched: Record<string, number>;

  fetchTicketData: (guildId: string, force?: boolean) => Promise<void>;
  fetchTickets: (
    guildId: string,
    options?: { status?: string; page?: number; limit?: number }
  ) => Promise<void>;
  fetchPanels: (guildId: string) => Promise<void>;
  fetchTranscripts: (guildId: string, skip?: number) => Promise<void>;
  fetchSettings: (guildId: string) => Promise<void>;
  fetchStaffStats: (guildId: string) => Promise<void>;
  updateSettings: (guildId: string, settings: Partial<TicketSettings>) => Promise<boolean>;
  createPanel: (guildId: string, panel: { channelId: string; title: string; description: string; categories?: TicketCategoryInput[] }) => Promise<{ panel: TicketPanel | null; message?: string; error?: string }>;
  deletePanel: (guildId: string, panelId: string) => Promise<boolean>;
  togglePanel: (guildId: string, panelId: string) => Promise<boolean>;
  updatePanel: (guildId: string, panelId: string, updates: { title?: string; description?: string; categories?: TicketCategoryInput[] }) => Promise<{ success: boolean; message?: string; messageRefreshed?: boolean; error?: string }>;
  refreshPanel: (guildId: string, panelId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  clearCache: (guildId?: string) => void;
  getGuildData: (guildId: string) => GuildTicketData;
}

const CACHE_DURATION = 2 * 60 * 1000;

const DEFAULT_GUILD_DATA: GuildTicketData = {
  tickets: [],
  stats: null,
  panels: [],
  transcripts: [],
  transcriptTotal: 0,
  settings: null,
  staffStats: [],
  total: 0,
  page: 1,
  hasMore: false,
};

export const useTicketStore = create<TicketState>()(
  persist(
    (set, get) => ({
      dataCache: {},
      isLoading: false,
      isError: null,
      lastFetched: {},

      getGuildData: (guildId: string) => {
        return get().dataCache[guildId] ?? DEFAULT_GUILD_DATA;
      },

      fetchTicketData: async (guildId: string, force = false) => {
        const state = get();
        const now = Date.now();
        const lastFetch = state.lastFetched[guildId] || 0;
        const cached = state.dataCache[guildId];

        if (!force && cached && now - lastFetch < CACHE_DURATION) {
          return;
        }

        set({ isLoading: true, isError: null });

        try {
          const [ticketsRes, statsRes, panelsRes, transcriptsRes, settingsRes, staffRes] =
            await Promise.all([
              fetch(`/api/guilds/${guildId}/tickets?limit=50`),
              fetch(`/api/guilds/${guildId}/tickets/stats`),
              fetch(`/api/guilds/${guildId}/tickets/panels`),
              fetch(`/api/guilds/${guildId}/tickets/transcripts?limit=10`),
              fetch(`/api/guilds/${guildId}/tickets/settings`),
              fetch(`/api/guilds/${guildId}/tickets/staff`),
            ]);

          let ticketsData: Ticket[] = [];
          let total = 0;
          let hasMore = false;

          if (ticketsRes.ok) {
            const data = await ticketsRes.json();
            ticketsData = data.tickets || data.data?.tickets || [];
            total = data.total || data.data?.total || ticketsData.length;
            hasMore = data.hasMore || data.data?.hasMore || false;
          }

          let statsData: TicketStats | null = null;
          if (statsRes.ok) {
            const data = await statsRes.json();
            statsData = data.stats || data.data?.stats || null;
          }

          let panelsData: TicketPanel[] = [];
          if (panelsRes.ok) {
            const data = await panelsRes.json();
            panelsData = data.panels || data.data?.panels || [];
          }

          let transcriptsData: Transcript[] = [];
          let transcriptTotal = 0;
          if (transcriptsRes.ok) {
            const data = await transcriptsRes.json();
            transcriptsData = data.transcripts || data.data?.transcripts || [];
            transcriptTotal = data.total || data.data?.total || transcriptsData.length;
          }

          let settingsData: TicketSettings | null = null;
          if (settingsRes.ok) {
            const data = await settingsRes.json();
            settingsData = data.ticketSettings || data.data?.ticketSettings || null;
          }

          let staffData: StaffMember[] = [];
          if (staffRes.ok) {
            const data = await staffRes.json();
            staffData = data.staffStats || data.data?.staffStats || [];
          }

          set({
            dataCache: {
              ...get().dataCache,
              [guildId]: {
                tickets: ticketsData,
                stats: statsData,
                panels: panelsData,
                transcripts: transcriptsData,
                transcriptTotal,
                settings: settingsData,
                staffStats: staffData,
                total,
                page: 1,
                hasMore,
              },
            },
            lastFetched: { ...get().lastFetched, [guildId]: now },
            isLoading: false,
          });
        } catch (error) {
          console.error("Ticket Store: Fetch failed", error);
          set({
            isError:
              error instanceof Error
                ? error
                : new Error("Failed to synchronize ticket data"),
            isLoading: false,
          });
        }
      },

      fetchTickets: async (guildId, options = {}) => {
        const { status, page = 1, limit = 50 } = options;
        set({ isLoading: true, isError: null });

        try {
          const params = new URLSearchParams({ limit: String(limit), page: String(page) });
          if (status && status !== "all") params.set("status", status);

          const res = await fetch(`/api/guilds/${guildId}/tickets?${params}`);
          if (!res.ok) throw new Error("Failed to fetch tickets");

          const data = await res.json();
          const tickets = data.tickets || data.data?.tickets || [];
          const total = data.total || data.data?.total || tickets.length;
          const hasMore = data.hasMore || data.data?.hasMore || false;

          set({
            dataCache: {
              ...get().dataCache,
              [guildId]: {
                ...(get().dataCache[guildId] || DEFAULT_GUILD_DATA),
                tickets,
                total,
                page,
                hasMore,
              },
            },
            isLoading: false,
          });
        } catch (error) {
          set({
            isError: error instanceof Error ? error : new Error("Failed to fetch tickets"),
            isLoading: false,
          });
        }
      },

      fetchPanels: async (guildId: string) => {
        try {
          const res = await fetch(`/api/guilds/${guildId}/tickets/panels`);
          if (!res.ok) throw new Error("Failed to fetch panels");
          const data = await res.json();
          const panels = data.panels || data.data?.panels || [];

          set({
            dataCache: {
              ...get().dataCache,
              [guildId]: {
                ...(get().dataCache[guildId] || DEFAULT_GUILD_DATA),
                panels,
              },
            },
          });
        } catch (error) {
          console.error("Ticket Store: Fetch panels failed", error);
        }
      },

      fetchTranscripts: async (guildId: string, skip = 0) => {
        try {
          const res = await fetch(`/api/guilds/${guildId}/tickets/transcripts?limit=10&skip=${skip}`);
          if (!res.ok) throw new Error("Failed to fetch transcripts");
          const data = await res.json();
          const transcripts = data.transcripts || data.data?.transcripts || [];
          const transcriptTotal = data.total || data.data?.total || transcripts.length;

          set({
            dataCache: {
              ...get().dataCache,
              [guildId]: {
                ...(get().dataCache[guildId] || DEFAULT_GUILD_DATA),
                transcripts,
                transcriptTotal,
              },
            },
          });
        } catch (error) {
          console.error("Ticket Store: Fetch transcripts failed", error);
        }
      },

      fetchSettings: async (guildId: string) => {
        try {
          const res = await fetch(`/api/guilds/${guildId}/tickets/settings`);
          if (!res.ok) throw new Error("Failed to fetch settings");
          const data = await res.json();
          const settings = data.ticketSettings || data.data?.ticketSettings || null;

          set({
            dataCache: {
              ...get().dataCache,
              [guildId]: {
                ...(get().dataCache[guildId] || DEFAULT_GUILD_DATA),
                settings,
              },
            },
          });
        } catch (error) {
          console.error("Ticket Store: Fetch settings failed", error);
        }
      },

      fetchStaffStats: async (guildId: string) => {
        try {
          const res = await fetch(`/api/guilds/${guildId}/tickets/staff`);
          if (!res.ok) throw new Error("Failed to fetch staff stats");
          const data = await res.json();
          const staffStats = data.staffStats || data.data?.staffStats || [];

          set({
            dataCache: {
              ...get().dataCache,
              [guildId]: {
                ...(get().dataCache[guildId] || DEFAULT_GUILD_DATA),
                staffStats,
              },
            },
          });
        } catch (error) {
          console.error("Ticket Store: Fetch staff stats failed", error);
        }
      },

      updateSettings: async (guildId: string, newSettings: Partial<TicketSettings>) => {
        try {
          const res = await fetch(`/api/guilds/${guildId}/tickets/settings`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newSettings),
          });
          if (!res.ok) throw new Error("Failed to update settings");
          const data = await res.json();
          const settings = data.ticketSettings || data.data?.ticketSettings || null;

          set({
            dataCache: {
              ...get().dataCache,
              [guildId]: {
                ...(get().dataCache[guildId] || DEFAULT_GUILD_DATA),
                settings,
              },
            },
          });
          return true;
        } catch (error) {
          console.error("Ticket Store: Update settings failed", error);
          return false;
        }
      },

      createPanel: async (guildId: string, panel: { channelId: string; title: string; description: string; categories?: TicketCategoryInput[] }) => {
        try {
          const res = await fetch(`/api/guilds/${guildId}/tickets/panels`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(panel),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.message || data?.error || "Failed to create panel");
          const newPanel = data.panel || data.data?.panel || null;

          if (newPanel) {
            const current = get().dataCache[guildId] || DEFAULT_GUILD_DATA;
            set({
              dataCache: {
                ...get().dataCache,
                [guildId]: {
                  ...current,
                  panels: [...current.panels, newPanel],
                },
              },
            });
          }
          return { panel: newPanel, message: data.message };
        } catch (error) {
          console.error("Ticket Store: Create panel failed", error);
          return { panel: null, error: (error as Error).message };
        }
      },

      deletePanel: async (guildId: string, panelId: string) => {
        try {
          const res = await fetch(`/api/guilds/${guildId}/tickets/panels/${panelId}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to delete panel");

          const current = get().dataCache[guildId] || DEFAULT_GUILD_DATA;
          set({
            dataCache: {
              ...get().dataCache,
              [guildId]: {
                ...current,
                panels: current.panels.filter((p) => p.panelId !== panelId),
              },
            },
          });
          return true;
        } catch (error) {
          console.error("Ticket Store: Delete panel failed", error);
          return false;
        }
      },

      togglePanel: async (guildId: string, panelId: string) => {
        try {
          const res = await fetch(`/api/guilds/${guildId}/tickets/panels/${panelId}/toggle`, {
            method: "PUT",
          });
          if (!res.ok) throw new Error("Failed to toggle panel");
          const data = await res.json();
          const updated = data.panel || data.data?.panel || null;

          if (updated) {
            const current = get().dataCache[guildId] || DEFAULT_GUILD_DATA;
            set({
              dataCache: {
                ...get().dataCache,
                [guildId]: {
                  ...current,
                  panels: current.panels.map((p) =>
                    p.panelId === panelId ? { ...p, settings: { enabled: updated.settings?.enabled ?? !p.settings?.enabled } } : p
                  ),
                },
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Ticket Store: Toggle panel failed", error);
          return false;
        }
      },

      updatePanel: async (guildId: string, panelId: string, updates: { title?: string; description?: string; categories?: TicketCategoryInput[] }) => {
        try {
          const res = await fetch(`/api/guilds/${guildId}/tickets/panels/${panelId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.message || data?.error || "Failed to update panel");
          }
          const data = await res.json();
          const updated = data.panel || data.data?.panel || null;

          if (updated) {
            const current = get().dataCache[guildId] || DEFAULT_GUILD_DATA;
            set({
              dataCache: {
                ...get().dataCache,
                [guildId]: {
                  ...current,
                  panels: current.panels.map((p) =>
                    p.panelId === panelId ? { ...p, ...updated } : p
                  ),
                },
              },
            });
          }
          return { success: true, message: data.message, messageRefreshed: Boolean(data.messageRefreshed) };
        } catch (error) {
          console.error("Ticket Store: Update panel failed", error);
          return { success: false, error: (error as Error).message };
        }
      },

      refreshPanel: async (guildId: string, panelId: string) => {
        try {
          const res = await fetch(`/api/guilds/${guildId}/tickets/panels/${panelId}/refresh`, {
            method: "POST",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data?.message || data?.error || "Failed to refresh panel message");
          }
          return { success: true, message: data.message };
        } catch (error) {
          console.error("Ticket Store: Refresh panel failed", error);
          return { success: false, error: (error as Error).message };
        }
      },

      clearCache: (guildId) => {
        if (guildId) {
          const newLastFetched = { ...get().lastFetched };
          const newDataCache = { ...get().dataCache };
          delete newLastFetched[guildId];
          delete newDataCache[guildId];
          set({ lastFetched: newLastFetched, dataCache: newDataCache });
        } else {
          set({ lastFetched: {}, dataCache: {} });
        }
      },
    }),
    {
      name: "ticket-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dataCache: state.dataCache,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
