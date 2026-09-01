import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { z } from "zod";

/**
 * Goodbye System Schemas
 */
export const GoodbyeSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  channelId: z.string().nullable().optional().default(null),
  message: z.string().optional().default("Goodbye {user}! We'll miss you. 👋"),
  embed: z.boolean().optional().default(false),
});

export type GoodbyeSettings = z.infer<typeof GoodbyeSettingsSchema>;

interface GuildGoodbyeData {
  settings: GoodbyeSettings | null;
  isLoading: boolean;
  isError: Error | null;
}

interface GoodbyeState {
  dataCache: Record<string, GuildGoodbyeData>;
  lastFetched: Record<string, number>;

  fetchGoodbyeData: (guildId: string, force?: boolean) => Promise<void>;
  updateSettings: (guildId: string, settings: Partial<GoodbyeSettings>) => void;
  clearCache: (guildId?: string) => void;

  getGuildData: (guildId: string) => GuildGoodbyeData;
}

const CACHE_DURATION = 5 * 60 * 1000;

const DEFAULT_GOODBYE_SETTINGS: GoodbyeSettings = {
  enabled: false,
  channelId: null,
  message: "Goodbye {user}! We'll miss you. 👋",
  embed: false,
};

const DEFAULT_GUILD_DATA: GuildGoodbyeData = {
  settings: null,
  isLoading: false,
  isError: null,
};

export const useGoodbyeStore = create<GoodbyeState>()(
  persist(
    (set, get) => ({
      dataCache: {},
      lastFetched: {},

      getGuildData: (guildId: string) => {
        return get().dataCache[guildId] ?? DEFAULT_GUILD_DATA;
      },

      fetchGoodbyeData: async (guildId: string, force = false) => {
        const state = get();
        const now = Date.now();
        const lastFetch = state.lastFetched[guildId] || 0;
        const cached = state.dataCache[guildId];

        if (!force && cached?.settings && now - lastFetch < CACHE_DURATION) {
          return;
        }

        set({
          dataCache: {
            ...get().dataCache,
            [guildId]: {
              ...DEFAULT_GUILD_DATA,
              isLoading: true,
            },
          },
        });

        try {
          const response = await fetch(`/api/guilds/${guildId}/settings`);

          if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
              const errorData = await response.json();
              throw new Error(
                errorData.message ||
                  errorData.error ||
                  `Server error: ${response.status}`
              );
            } else {
              if (response.status === 503) {
                throw new Error(
                  "Bot service is currently unavailable. Please try again later."
                );
              }
              throw new Error(`Server error: ${response.status}`);
            }
          }

          const data = await response.json();

          let settingsData: GoodbyeSettings | null = null;

          const goodbyeData =
            data.settings?.goodbyeSystem ||
            data.goodbyeSystem ||
            data.settings?.goodbye ||
            null;

          if (goodbyeData) {
            const result = GoodbyeSettingsSchema.safeParse(goodbyeData);
            if (result.success) {
              settingsData = result.data;
            } else {
              settingsData = {
                ...DEFAULT_GOODBYE_SETTINGS,
                ...goodbyeData,
              } as GoodbyeSettings;
            }
          } else {
            settingsData = DEFAULT_GOODBYE_SETTINGS;
          }

          set({
            dataCache: {
              ...get().dataCache,
              [guildId]: {
                settings: settingsData,
                isLoading: false,
                isError: null,
              },
            },
            lastFetched: { ...get().lastFetched, [guildId]: now },
          });
        } catch (error) {
          console.error("Goodbye Store: Fetch failed", error);
          set({
            dataCache: {
              ...get().dataCache,
              [guildId]: {
                settings: null,
                isLoading: false,
                isError:
                  error instanceof Error
                    ? error
                    : new Error("Failed to load goodbye settings"),
              },
            },
          });
        }
      },

      updateSettings: (guildId, newSettings) => {
        const cached = get().dataCache[guildId];
        if (!cached?.settings) return;

        set({
          dataCache: {
            ...get().dataCache,
            [guildId]: {
              ...cached,
              settings: { ...cached.settings, ...newSettings },
            },
          },
        });
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
      name: "goodbye-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dataCache: state.dataCache,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
