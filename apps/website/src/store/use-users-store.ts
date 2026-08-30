import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserData {
  id: string;
  username: string;
  globalName: string;
  avatar: string | null;
  role: string;
  credits: number;
  lastLogin: string;
  createdAt: string;
  isPayer?: boolean;
}

interface UsersState {
  users: UserData[];
  pagination: {
    page: number;
    total: number;
    pages: number;
  } | null;
  searchQuery: string | null;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  fetchUsers: (
    search?: string,
    force?: boolean,
    page?: number
  ) => Promise<void>;
  fetchUser: (userId: string) => Promise<UserData | null>; // Fetch single user fresh
  updateUserRole: (userId: string, role: string) => void;
  clearUsers: () => void;
  invalidateCache: () => void; // Force refresh on next access
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache for admin users list

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      pagination: null,
      searchQuery: null,
      currentPage: 1,
      isLoading: false,
      error: null,
      lastFetched: null,

      fetchUsers: async (search?: string, force = false, page = 1) => {
        const { lastFetched, searchQuery, currentPage, isLoading, users } = get();

        // Cache is only valid for the exact same search + page combination
        const now = Date.now();
        const isCacheValid = lastFetched && now - lastFetched < CACHE_DURATION;
        const isSameQuery = search === searchQuery;
        const isSamePage = page === currentPage;

        if (!force && isCacheValid && isSameQuery && isSamePage && users.length > 0) {
          return;
        }

        if (isLoading) return;

        set({ isLoading: true, error: null });

        try {
          const session = await fetch("/api/auth/session").then((res) =>
            res.json()
          );
          const userId = session?.user?.id;

          if (!userId) {
            set({ isLoading: false, error: "Unauthorized" });
            return;
          }

          const query = new URLSearchParams({
            limit: "10",
            page: String(page || 1),
            ...(search && { search }),
          });

          const response = await fetch(`/api/user?${query.toString()}`, {
            headers: {
              "X-User-ID": userId,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.status}`);
          }

          const result = await response.json();

          // Only update if we got valid data (not empty due to API error)
          if (result.users && result.pagination?.total !== undefined) {
            set({
              users: result.users,
              pagination: result.pagination,
              searchQuery: search || null,
              currentPage: page,
              lastFetched: Date.now(),
              isLoading: false,
            });
          } else {
            // Keep cached data if API returned empty due to error
            set({ isLoading: false });
          }
        } catch {
          // Silently handle errors - keep cached data on error
          set({ error: "Failed to load users", isLoading: false });
        }
      },

      updateUserRole: (userId: string, role: string) => {
        const { users } = get();
        const updatedUsers = users.map((user) =>
          user.id === userId ? { ...user, role } : user
        );
        set({ users: updatedUsers });
      },

      fetchUser: async (userId: string) => {
        try {
          const session = await fetch("/api/auth/session").then((res) =>
            res.json()
          );
          const currentUserId = session?.user?.id;

          if (!currentUserId) return null;

          const response = await fetch(`/api/user/${userId}`, {
            headers: {
              "X-User-ID": currentUserId,
            },
          });

          if (!response.ok) return null;

          const userData = await response.json();

          if (userData.user) {
            // Update the user in the list if exists, otherwise add
            const { users } = get();
            const existingIndex = users.findIndex((u) => u.id === userId);

            if (existingIndex >= 0) {
              const updatedUsers = [...users];
              updatedUsers[existingIndex] = userData.user;
              set({ users: updatedUsers });
            }

            return userData.user;
          }

          return null;
        } catch {
          return null;
        }
      },

      invalidateCache: () => {
        set({ lastFetched: 0 }); // Force refresh on next fetch
      },

      clearUsers: () => {
        set({
          users: [],
          pagination: null,
          searchQuery: null,
          lastFetched: null,
        });
      },
    }),
    {
      name: "admin-users-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        users: state.users,
        pagination: state.pagination,
        searchQuery: state.searchQuery,
        currentPage: state.currentPage,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
