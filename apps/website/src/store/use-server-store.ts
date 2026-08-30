import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DiscordGuild, DiscordGuildSchema } from "@/types/settings";

export type { DiscordGuild };
import { z } from "zod";

interface ServerState {
  guilds: DiscordGuild[];
  installedGuildIds: string[];
  isLoading: boolean;
  isFetching: boolean;
  error: "none" | "re-login" | "error";
  lastFetched: number | null;
  lastActiveGuildId: string | null;

  // Actions
  fetchServers: (force?: boolean) => Promise<void>;
  setGuilds: (guilds: DiscordGuild[]) => void;
  setInstalledGuildIds: (ids: string[]) => void;
  setLastActiveGuildId: (id: string | null) => void;
  clearServers: () => void;
}

// Request deduplication: prevent multiple simultaneous fetches
let fetchPromise: Promise<void> | null = null;

export const useServerStore = create<ServerState>()(
  persist(
    (set, get) => ({
      guilds: [],
      installedGuildIds: [],
      isLoading: true, // Default to true to prevent flickering during initial auth/fetch checks
      isFetching: false,
      error: "none",
      lastFetched: null,
      lastActiveGuildId: null,

      fetchServers: async (force = false) => {
        // If already fetching and not forced, return the existing promise
        if (fetchPromise && !force) {
          console.log("Server store: Deduplicating fetch request");
          return fetchPromise;
        }

        const {
          lastFetched,
          guilds: currentGuilds,
          isLoading: currentLoading,
        } = get();

        // Cache duration: 5 minutes (increased from 2 for better performance)
        const CACHE_DURATION = 5 * 60 * 1000;
        const now = Date.now();
        if (!force && lastFetched && now - lastFetched < CACHE_DURATION) {
          console.log("Server store: Using cached guilds");
          if (currentLoading !== false) {
            set({ isLoading: false, isFetching: false });
          }
          return;
        }

        // If we have guilds and are not forced, don't show loading even if fetching in background
        if (!force && currentGuilds.length > 0) {
          set({ error: "none", isFetching: true }); // Just clear error and show fetching
        } else {
          set({ isLoading: true, isFetching: true, error: "none" });
        }

        // Create and store the fetch promise for deduplication
        fetchPromise = (async () => {
          try {
            console.log("Server store: Fetching Discord guilds...");
            const res = await fetch("/api/discord/guilds");

            if (!res.ok) {
              console.error("Server store: Discord fetch failed", res.status);
              if (res.status === 401) {
                set({ error: "re-login", isLoading: false, isFetching: false });
                return;
              }
              throw new Error("Failed to fetch guilds from Discord");
            }

            const text = await res.text();
            let json: unknown;
            try {
              json = text ? JSON.parse(text) : null;
            } catch {
              throw new Error("Server returned non-JSON response");
            }
            const result = z.array(DiscordGuildSchema).safeParse(json);

            if (!result.success) {
              console.error(
                "Server store: Guild validation failed",
                result.error.format()
              );
              throw new Error("Invalid guild data received from Discord API");
            }

            const manageableGuilds = result.data;
            set({ guilds: manageableGuilds });
            console.log(
              `Server store: Found ${manageableGuilds.length} manageable guilds`
            );

            if (manageableGuilds.length > 0) {
              console.log("Server store: Checking bot installation status...");
              const botRes = await fetch("/api/guilds/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  guildIds: manageableGuilds.map((g) => g.id),
                }),
              });

              if (botRes.ok) {
                let botData: unknown;
                try {
                  const botText = await botRes.text();
                  botData = botText ? JSON.parse(botText) : null;
                } catch {
                  console.warn("Server store: Bot check returned non-JSON");
                  botData = null;
                }
                const BotInstallationSchema = z.object({
                  installedGuilds: z.array(z.string()).optional(),
                  data: z
                    .object({ installedGuilds: z.array(z.string()).optional() })
                    .optional(),
                });

                const botResult = BotInstallationSchema.safeParse(botData);
                const ids =
                  (botResult.success ? botResult.data.installedGuilds : null) ||
                  (botResult.success && botResult.data.data
                    ? botResult.data.data.installedGuilds
                    : null) ||
                  [];

                set({ installedGuildIds: ids });
                console.log(
                  `Server store: Found ${ids.length} installed guilds`
                );
              } else {
                console.warn("Server store: Bot check failed", botRes.status);
              }
            }

            set({
              lastFetched: Date.now(),
              isLoading: false,
              isFetching: false,
            });
          } catch (err) {
            console.error("Server store fetch error:", err);
            set({ error: "error", isLoading: false, isFetching: false });
          } finally {
            // Clear the promise after completion
            fetchPromise = null;
          }
        })();

        return fetchPromise;
      },

      setGuilds: (guilds) => set({ guilds }),
      setInstalledGuildIds: (ids) => set({ installedGuildIds: ids }),
      setLastActiveGuildId: (id) => set({ lastActiveGuildId: id }),
      clearServers: () =>
        set({
          guilds: [],
          installedGuildIds: [],
          lastFetched: null,
          lastActiveGuildId: null,
          error: "none",
        }),
    }),
    {
      name: "server-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        guilds: state.guilds,
        installedGuildIds: state.installedGuildIds,
        lastFetched: state.lastFetched,
        lastActiveGuildId: state.lastActiveGuildId,
      }),
    }
  )
);
