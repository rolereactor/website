import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ProEngineSettingsSchema } from "@/types/settings";
export type { ProEngineSettings, ProSubscription } from "@/types/settings";
import type { ProEngineSettings } from "@/types/settings";

interface ProEngineState {
  // Per-guild settings cache
  settingsCache: Record<string, ProEngineSettings>;
  currentGuildId: string | null;
  isLoading: boolean;
  isError: Error | null;
  lastFetched: Record<string, number>; // guildId -> timestamp

  // Computed getter — returns settings for the current guild
  settings: ProEngineSettings | null;

  // Actions
  fetchSettings: (guildId: string, force?: boolean) => Promise<void>;
  updateLocalSettings: (
    settings: Partial<ProEngineSettings>,
    guildId?: string
  ) => void;
  clearCache: (guildId?: string) => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProEngineStore = create<ProEngineState>()(
  persist(
    (set, get) => ({
      settingsCache: {},
      currentGuildId: null,
      isLoading: false,
      isError: null,
      lastFetched: {},

      // Derived: returns settings for the current guild
      get settings() {
        const state = get();
        if (!state.currentGuildId) return null;
        return state.settingsCache[state.currentGuildId] ?? null;
      },

      fetchSettings: async (guildId: string, force = false) => {
        const state = get();
        const now = Date.now();
        const lastFetch = state.lastFetched[guildId] || 0;
        const cachedSettings = state.settingsCache[guildId];

        // Always update currentGuildId so UI knows which guild we're viewing
        if (state.currentGuildId !== guildId) {
          set({ currentGuildId: guildId });
        }

        // Skip fetch if cache is still fresh
        if (!force && cachedSettings && now - lastFetch < CACHE_DURATION) {
          return;
        }

        set({ isLoading: true, isError: null });

        try {
          const res = await fetch(`/api/guilds/${guildId}/settings`);
          if (!res.ok) {
            let errorMsg = "Failed to fetch settings";
            try {
              const error = await res.json();
              errorMsg = error.message || error.error || `Error ${res.status}`;
            } catch {
              errorMsg = `Error ${res.status}: ${res.statusText}`;
            }
            console.warn(`[Pro Engine] API returned ${res.status}:`, errorMsg);
            // Keep cached data; surface error only when nothing to show
            set({
              isLoading: false,
              ...(cachedSettings
                ? {}
                : { isError: new Error(errorMsg) }),
            });
            return;
          }

          const json = await res.json();
          const result = ProEngineSettingsSchema.safeParse(json);

          if (!result.success) {
            console.error(
              "Pro Engine Store: Validation failed",
              result.error.format()
            );
            // Keep cached data on validation error
            set({
              isLoading: false,
              ...(cachedSettings
                ? {}
                : {
                    isError: new Error(
                      "Received invalid settings data from the bot."
                    ),
                  }),
            });
            return;
          }

          const data = result.data;

          set({
            settingsCache: { ...get().settingsCache, [guildId]: data },
            lastFetched: { ...get().lastFetched, [guildId]: now },
            currentGuildId: guildId,
            isLoading: false,
            isError: null,
          });
        } catch (error) {
          // Network error - keep cached data; surface error only when nothing to show
          console.warn(
            "[Pro Engine] Network error, keeping cached data:",
            error instanceof Error ? error.message : error
          );
          set({
            isLoading: false,
            ...(cachedSettings
              ? {}
              : {
                  isError: new Error(
                    "Could not reach the bot service. Please try again."
                  ),
                }),
          });
        }
      },

      updateLocalSettings: (newSettings, guildId?: string) => {
        const state = get();
        const targetGuildId = guildId || state.currentGuildId;
        if (!targetGuildId) return;

        const currentData = state.settingsCache[targetGuildId];

        // If no current data, create minimal structure for activation
        const baseData = currentData || {
          isPremium: { pro: false },
          premiumConfig: newSettings.premiumConfig || {
            PRO: {
              id: "pro_engine",
              name: "Pro Engine",
              description: "",
              cost: 20,
              period: "week",
              periodDays: 7,
              includes: [],
            },
          },
        };

        set({
          settingsCache: {
            ...state.settingsCache,
            [targetGuildId]: {
              ...baseData,
              ...newSettings,
              isPremium:
                typeof baseData?.isPremium === "object"
                  ? {
                      ...baseData.isPremium,
                      ...((newSettings.isPremium as object) || {}),
                    }
                  : {
                      pro: false,
                      ...((newSettings.isPremium as object) || {}),
                    },
              subscription:
                newSettings.subscription && baseData?.subscription
                  ? { ...baseData.subscription, ...newSettings.subscription }
                  : newSettings.subscription || baseData?.subscription,
            },
          },
        });
      },

      clearCache: (guildId) => {
        if (guildId) {
          const newLastFetched = { ...get().lastFetched };
          const newSettingsCache = { ...get().settingsCache };
          delete newLastFetched[guildId];
          delete newSettingsCache[guildId];
          set({
            lastFetched: newLastFetched,
            settingsCache: newSettingsCache,
            ...(get().currentGuildId === guildId
              ? { currentGuildId: null }
              : {}),
          });
        } else {
          set({
            lastFetched: {},
            settingsCache: {},
            currentGuildId: null,
          });
        }
      },
    }),
    {
      name: "pro-engine-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settingsCache: state.settingsCache,
        lastFetched: state.lastFetched,
        currentGuildId: state.currentGuildId,
      }),
    }
  )
);
