import "server-only";
import { cache } from "react";
import { auth } from "@/auth";
import { botFetchJson, isBotUnavailableError } from "@/lib/bot-fetch";
import type { DiscordGuild } from "@/store/use-server-store";
import { unstable_cache } from "next/cache";

/**
 * Internal worker to fetch guilds from Discord.
 * Uses standard fetch caching for performance.
 */
interface DiscordGuildResponse {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
  owner: boolean;
}

// In-memory cache to prevent redundant Discord API calls within the same process
const GUILD_CACHE = new Map<
  string,
  { data: DiscordGuildResponse[]; expires: number }
>();

// In-memory fallback cache to prevent dashboard lockouts if the Bot API throws 503s
const BOT_INSTALL_CACHE = new Map<string, string[]>();

async function fetchDiscordGuildsInternal(accessToken: string) {
  const now = Date.now();
  const cached = GUILD_CACHE.get(accessToken);

  if (cached && cached.expires > now) {
    return cached.data;
  }

  const response = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "User-Agent": `RoleReactorWebsite (${process.env.NEXT_PUBLIC_WEBSITE_URL || "https://rolereactor.xyz"}, 1.0.0)`,
    },
    next: { revalidate: 300 }, // Full revalidation cache
  });

  if (!response.ok) {
    if (response.status === 401) return [];
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after")) || 1;
      console.warn(
        `[Discord API] Rate limited (429). Retry after: ${retryAfter}s. Returning cached/empty.`
      );
      // If we have a stale cache, return it during rate limiting
      return cached?.data || [];
    }
    throw new Error(`Discord API Error: ${response.status}`);
  }

  const data = (await response.json()) as DiscordGuildResponse[];

  // Set in-memory cache for 5 minutes (matches fetch revalidate window)
  GUILD_CACHE.set(accessToken, { data, expires: now + 300000 });

  return data;
}

/**
 * Internal cached worker to check bot installation.
 * Uses unstable_cache to factor the guild IDs into the cache key.
 */
const checkBotInstallationCached = unstable_cache(
  async (guildIds: string[]) => {
    const botData = await botFetchJson<Record<string, unknown>>(
      "/guilds/check",
      {
        method: "POST",
        body: JSON.stringify({ guildIds }),
        silent: true,
      }
    );

    return (
      (botData.installedGuilds as string[]) ||
      ((botData.data as Record<string, unknown>)
        ?.installedGuilds as string[]) ||
      []
    );
  },
  ["bot-installation-check"],
  { revalidate: 15 } // Short cache to recover quickly from bot restarts
);

/**
 * Fetches manageable guilds from Discord and checks which ones have the bot installed.
 * Designed to be called from Server Components (layouts/pages).
 */
export const getManageableGuilds = cache(async () => {
  const session = await auth();
  const sessionWithToken = session as typeof session & { accessToken?: string };

  if (!session?.user || !sessionWithToken.accessToken) {
    return { guilds: [], installedGuildIds: [] };
  }

  try {
    const accessToken = sessionWithToken.accessToken;

    // 1. Fetch from Discord (Cached)
    const allGuilds = await fetchDiscordGuildsInternal(accessToken);

    // 2. Filter for servers where user has MANAGE_GUILD or ADMIN
    const manageableGuilds: DiscordGuild[] = allGuilds
      .filter((guild) => {
        const permissions = BigInt(guild.permissions ?? "0");
        const isAdmin = (permissions & BigInt(0x8)) === BigInt(0x8);
        const canManage = (permissions & BigInt(0x20)) === BigInt(0x20);
        return guild.owner === true || isAdmin || canManage;
      })
      .map((g) => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        permissions: g.permissions,
      }));

    if (manageableGuilds.length === 0) {
      return { guilds: [], installedGuildIds: [] };
    }

    // 3. Check bot installation status (Cached)
    let installedGuildIds: string[] = [];
    const cacheKey = accessToken.slice(-10); // Use a partial token as a key for the fallback map

    try {
      installedGuildIds = await checkBotInstallationCached(
        manageableGuilds.map((g) => g.id)
      );
      // Save last known good state
      BOT_INSTALL_CACHE.set(cacheKey, installedGuildIds);
    } catch (e) {
      if (isBotUnavailableError(e)) {
        console.warn(
          "[Server] Bot API /guilds/check timed out or is unreachable. Using memory fallback..."
        );
      } else {
        console.warn(
          "[Server] Bot API /guilds/check failed. Attempting to use memory fallback...",
          e
        );
      }
      // Use cached value if available, otherwise fall back to [] gracefully.
      // The bot being unreachable should never prevent the dashboard from loading.
      installedGuildIds = BOT_INSTALL_CACHE.get(cacheKey) ?? [];
    }

    return {
      guilds: manageableGuilds,
      installedGuildIds,
    };
  } catch (error) {
    const err = error ?? new Error("Unknown error");
    console.error("[Server] Failed to fetch manageable guilds:", err);

    // If the entire thing fails, but we have some fallback we can try to recover
    const fallbackGuilds =
      GUILD_CACHE.get(sessionWithToken.accessToken || "")?.data || [];
    const fallbackInstalled =
      BOT_INSTALL_CACHE.get(sessionWithToken.accessToken?.slice(-10) || "") ||
      [];

    if (fallbackGuilds.length > 0) {
      return {
        guilds: fallbackGuilds.map((g) => ({
          id: g.id,
          name: g.name,
          icon: g.icon,
          permissions: g.permissions,
        })),
        installedGuildIds: fallbackInstalled,
      };
    }

    return { guilds: [], installedGuildIds: [] };
  }
});
