import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PricingData } from "../types/pricing";

interface PricingStore {
  data: PricingData | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedPackages: number | null;
  lastFetchedUser: number | null;
  fetchPromise: Promise<void> | null;
  /**
   * Fetches pricing data.
   * @param userId - Optional user ID to fetch user-specific pricing/details.
   * @param force - If true, ignores cache and forces a fresh fetch.
   */
  fetchPricing: (userId?: string, force?: boolean) => Promise<void>;
  /**
   * Manually updates the locally stored user balance (e.g. after purchase).
   */
  updateUserBalance: (newBalance: number) => void;
}

export const usePricingStore = create<PricingStore>()(
  persist(
    (set, get) => ({
      data: null,
      isLoading: false,
      error: null,
      lastFetchedPackages: null,
      lastFetchedUser: null,

      fetchPromise: null,

      fetchPricing: async (userId?: string, force = false) => {
        const { data, lastFetchedPackages, lastFetchedUser, fetchPromise } =
          get();

        // Cache validity (e.g., 2 minutes)
        const CACHE_DURATION = 2 * 60 * 1000;
        const now = Date.now();
        const packagesCacheValid =
          lastFetchedPackages && now - lastFetchedPackages < CACHE_DURATION;
        const userCacheValid =
          lastFetchedUser && now - lastFetchedUser < CACHE_DURATION;

        const needsUserData = !!userId;
        const hasPackages = !!data?.packages?.length;
        const hasUserData = !!data?.user;

        if (!force) {
          const okPackages = hasPackages && packagesCacheValid;
          const okUser = !needsUserData || (hasUserData && userCacheValid);
          if (okPackages && okUser) return;
        }

        // Reuse existing promise if active to prevent duplicate requests
        if (fetchPromise) {
          console.log("Pricing store: Reusing active fetch promise");
          return fetchPromise;
        }

        console.log("Pricing store: Fetching fresh data...", {
          userId,
          force,
          packagesCacheValid,
          userCacheValid,
        });

        set({ isLoading: true, error: null });

        const promise = (async () => {
          try {
            const shouldFetchPackages =
              force || !hasPackages || !packagesCacheValid;
            const shouldFetchUser =
              !!userId && (force || !hasUserData || !userCacheValid);

            const safeFetchJson = async (url: string) => {
              try {
                const res = await fetch(url);
                if (!res.ok) return null;
                const text = await res.text();
                return JSON.parse(text);
              } catch {
                return null;
              }
            };

            const packagesPromise = shouldFetchPackages
              ? safeFetchJson("/api/pricing/packages")
              : Promise.resolve(null);

            const userPromise = shouldFetchUser
              ? safeFetchJson(`/api/pricing/balance?user_id=${userId}`)
              : Promise.resolve(null);

            const [packagesRes, userRes] = await Promise.all([
              packagesPromise,
              userPromise,
            ]);

            const nextData: PricingData = {
              ...(data ?? ({} as PricingData)),
              ...(packagesRes?.success && packagesRes.data
                ? packagesRes.data
                : {}),
              ...(userRes?.success && userRes.data ? userRes.data : {}),
            };

            // Don't throw errors - just use cached/empty data
            // This prevents UI errors when bot API is temporarily down (503)
            if (
              shouldFetchPackages &&
              !(packagesRes?.success && packagesRes.data)
            ) {
              console.warn(
                "[Pricing Store] Failed to fetch packages:",
                packagesRes?.message || packagesRes?.error
              );
              // Keep cached packages or use empty data
            }

            if (shouldFetchUser && !(userRes?.success && userRes.data)) {
              console.warn(
                "[Pricing Store] Failed to fetch user balance:",
                userRes?.message || userRes?.error
              );
              // Keep cached user data or use empty data
            }

            set({
              data: nextData,
              lastFetchedPackages:
                shouldFetchPackages && packagesRes?.success
                  ? Date.now()
                  : lastFetchedPackages,
              lastFetchedUser:
                shouldFetchUser && userRes?.success
                  ? Date.now()
                  : lastFetchedUser,
              isLoading: false,
              fetchPromise: null,
            });
          } catch (error) {
            // Silently handle network errors - keep existing data
            console.warn(
              "[Pricing Store] Network error, keeping cached data:",
              error instanceof Error ? error.message : error
            );
            set({
              isLoading: false,
              fetchPromise: null,
              // Don't set error state - keep showing cached data
            });
          }
        })();

        set({ fetchPromise: promise });
        return promise;
      },

      updateUserBalance: (newBalance: number) => {
        const { data } = get();
        if (data && data.user) {
          set({
            data: {
              ...data,
              user: {
                ...data.user,
                currentCredits: newBalance,
              },
            },
          });
        }
      },
    }),
    {
      name: "pricing-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        data: state.data,
        lastFetchedPackages: state.lastFetchedPackages,
        lastFetchedUser: state.lastFetchedUser,
      }),
    }
  )
);
