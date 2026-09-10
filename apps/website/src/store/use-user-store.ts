import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserPricingInfo, UserPricingInfoSchema } from "@/types/settings";

interface UserState {
  user: UserPricingInfo | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  fetchUser: (userId: string, force?: boolean) => Promise<void>;
  updateBalance: (newBalance: number) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      lastFetched: null,

      fetchUser: async (userId: string, force = false) => {
        const { user, lastFetched, isLoading } = get();

        // Return cached data if valid (e.g. 2 mins) and same user
        const CACHE_DURATION = 2 * 60 * 1000;
        const now = Date.now();
        const isCacheValid = lastFetched && now - lastFetched < CACHE_DURATION;

        if (!force && isCacheValid && user && user.userId === userId) {
          return;
        }

        if (isLoading) return;

        set({ isLoading: true, error: null });

        try {
          // currently fetching from pricing endpoint as it contains the credit info
          const response = await fetch(
            `/api/pricing/balance?user_id=${userId}`
          );

          // Bot service down or other non-ok response — degrade gracefully
          if (!response.ok) {
            console.warn(
              `User store: Balance fetch returned ${response.status}, keeping cached data`
            );
            set({ isLoading: false });
            return;
          }

          // Read text first to avoid crashing on non-JSON bodies
          const text = await response.text();
          let result: { success?: boolean; data?: { user?: unknown } };
          try {
            result = text ? JSON.parse(text) : {};
          } catch {
            console.warn("User store: Non-JSON response from balance endpoint");
            set({ isLoading: false });
            return;
          }

          if (result.success && result.data?.user) {
            const validation = UserPricingInfoSchema.safeParse(result.data.user);

            if (validation.success) {
              set({
                user: validation.data,
                lastFetched: Date.now(),
                isLoading: false,
              });
            } else {
              console.error(
                "User store: Validation failed",
                validation.error.format()
              );
              set({ isLoading: false, error: "Invalid user data format" });
            }
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("User store fetch error:", error);
          set({ error: "Failed to load user data", isLoading: false });
        }
      },

      updateBalance: (newBalance: number) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              currentCredits: newBalance,
            },
          });
        }
      },

      clearUser: () => {
        set({ user: null, lastFetched: null, error: null });
      },
    }),
    {
      name: "user-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
