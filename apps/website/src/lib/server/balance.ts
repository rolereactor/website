import "server-only";
import { after } from "next/server";
import { botFetch } from "@/lib/bot-fetch";
import type { UserPricingInfo } from "@/types/pricing";

export interface CoreBalanceData {
  success: true;
  balance: number;
  cores: number;
  sparks: number;
}

export interface PricingBalanceData extends UserPricingInfo {
  sparks?: number;
}

/** Fresh window must exceed client poll interval (60s). */
const FRESH_TTL = 90_000;
/** Serve stale for this long past expiry while refreshing in background. */
const STALE_GRACE = 60_000;
const MAX_ENTRIES = 500;
const BOT_TIMEOUT_MS = 4_000;

interface CacheEntry<T> {
  data: T;
  /** Absolute ms timestamp after which entry is fresh no longer. */
  freshUntil: number;
}

const coreBalanceCache = new Map<string, CacheEntry<CoreBalanceData>>();
const pricingBalanceCache = new Map<string, CacheEntry<PricingBalanceData>>();
const inflightCore = new Map<string, Promise<CoreBalanceData>>();
const inflightPricing = new Map<string, Promise<PricingBalanceData>>();

function prune<T>(cache: Map<string, CacheEntry<T>>): void {
  if (cache.size <= MAX_ENTRIES) return;
  // Map preserves insertion order — evict oldest first.
  const excess = cache.size - MAX_ENTRIES;
  let removed = 0;
  for (const key of cache.keys()) {
    if (removed >= excess) break;
    cache.delete(key);
    removed += 1;
  }
}

function round2(n: unknown): number {
  const value = Number(n);
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(2));
}

async function fetchCoreBalanceFromBot(
  userId: string
): Promise<CoreBalanceData> {
  const response = await botFetch(`/user/${userId}/balance`, {
    method: "GET",
    cache: "no-store",
    userId,
    signal: AbortSignal.timeout(BOT_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Balance fetch failed with status ${response.status}`);
  }

  const data = await response.json();
  if (data.status === "success" && data.credits !== undefined) {
    const cores = round2(data.credits);
    const sparks = round2(data.sparks ?? 0);
    return { success: true, balance: cores, cores, sparks };
  }

  throw new Error("Unexpected balance response shape");
}

function storeCore(userId: string, data: CoreBalanceData): CoreBalanceData {
  coreBalanceCache.set(userId, {
    data,
    freshUntil: Date.now() + FRESH_TTL,
  });
  prune(coreBalanceCache);
  return data;
}

function refreshCoreInBackground(userId: string): Promise<CoreBalanceData> {
  const existing = inflightCore.get(userId);
  if (existing) return existing;

  const promise = fetchCoreBalanceFromBot(userId)
    .then((data) => storeCore(userId, data))
    .catch((err) => {
      // Keep stale data; the next request will retry.
      throw err;
    })
    .finally(() => {
      inflightCore.delete(userId);
    });

  inflightCore.set(userId, promise);
  return promise;
}

/**
 * Server-side core balance with a 90s fresh cache and stale-while-revalidate.
 * Cold misses block up to 4s; stale hits return immediately and refresh via `after()`.
 * Throws when cold and the bot is unavailable (callers decide fallbacks).
 */
export async function getCoreBalance(userId: string): Promise<CoreBalanceData> {
  const entry = coreBalanceCache.get(userId);
  const now = Date.now();

  if (entry && entry.freshUntil > now) {
    return entry.data;
  }

  if (entry && now - entry.freshUntil <= STALE_GRACE) {
    const refresh = refreshCoreInBackground(userId);
    // Background refresh must not surface as an unhandled rejection.
    after(() => refresh.catch(() => undefined));
    return entry.data;
  }

  const existing = inflightCore.get(userId);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const data = await fetchCoreBalanceFromBot(userId);
      return storeCore(userId, data);
    } catch (err) {
      // Prefer slightly-stale data over failing when the bot blips.
      if (entry && now - entry.freshUntil <= STALE_GRACE * 5) {
        return entry.data;
      }
      throw err;
    } finally {
      inflightCore.delete(userId);
    }
  })();

  inflightCore.set(userId, promise);
  return promise;
}

/** Best-effort balance for UI seed slots — never throws. */
export async function getCoreBalanceSafe(
  userId: string
): Promise<CoreBalanceData | null> {
  try {
    return await getCoreBalance(userId);
  } catch {
    return null;
  }
}

/** Invalidate after purchases so the next read is fresh. */
export function invalidateCoreBalance(userId: string): void {
  coreBalanceCache.delete(userId);
}

function normalizePricingUser(raw: unknown): PricingBalanceData | null {
  if (!raw || typeof raw !== "object") return null;
  const u = raw as Record<string, unknown>;
  const credits = u.currentCredits;
  return {
    userId: String(u.requestedUserId ?? u.userId ?? ""),
    isFirstPurchase: Boolean(u.isFirstPurchase),
    currentCredits:
      credits === undefined || credits === null ? 0 : round2(credits),
    eligibleForFirstPurchaseBonus: Boolean(u.eligibleForFirstPurchaseBonus),
    sparks: round2(u.sparks ?? 0),
    ...(typeof u.hasActivePro === "boolean"
      ? { hasActivePro: u.hasActivePro }
      : {}),
  };
}

async function fetchPricingBalanceFromBot(
  userId: string
): Promise<PricingBalanceData> {
  const response = await botFetch(`/pricing?user_id=${userId}`, {
    method: "GET",
    cache: "no-store",
    userId,
    signal: AbortSignal.timeout(BOT_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Pricing balance fetch failed with status ${response.status}`);
  }

  const data = await response.json();

  if (data.success && data.data?.user) {
    const normalized = normalizePricingUser(data.data.user);
    if (normalized?.userId || normalized?.currentCredits !== undefined) {
      return normalized;
    }
  }

  if ((data.status === "success" || data.success === true) && data.user) {
    const normalized = normalizePricingUser(data.user);
    if (normalized) return normalized;
  }

  throw new Error("Unexpected pricing balance response shape");
}

/**
 * Pricing-flavored user info (first-purchase flags, etc.) with the same
 * cache/timeout policy as core balance. Only pricing flows should call this.
 */
export async function getPricingBalance(
  userId: string
): Promise<PricingBalanceData> {
  const entry = pricingBalanceCache.get(userId);
  const now = Date.now();

  if (entry && entry.freshUntil > now) {
    return entry.data;
  }

  if (entry && now - entry.freshUntil <= STALE_GRACE) {
    let refresh = inflightPricing.get(userId);
    if (!refresh) {
      refresh = fetchPricingBalanceFromBot(userId)
        .then((data) => {
          pricingBalanceCache.set(userId, {
            data,
            freshUntil: Date.now() + FRESH_TTL,
          });
          prune(pricingBalanceCache);
          return data;
        })
        .catch(() => entry.data)
        .finally(() => {
          inflightPricing.delete(userId);
        });
      inflightPricing.set(userId, refresh);
      const pendingRefresh = refresh;
      after(() => pendingRefresh.catch(() => undefined));
    }
    return entry.data;
  }

  const existingPricing = inflightPricing.get(userId);
  if (existingPricing) return existingPricing;

  const pricingPromise = (async () => {
    try {
      const data = await fetchPricingBalanceFromBot(userId);
      pricingBalanceCache.set(userId, {
        data,
        freshUntil: Date.now() + FRESH_TTL,
      });
      prune(pricingBalanceCache);
      return data;
    } catch (err) {
      if (entry) return entry.data;
      throw err;
    } finally {
      inflightPricing.delete(userId);
    }
  })();

  inflightPricing.set(userId, pricingPromise);
  return pricingPromise;
}

export function invalidatePricingBalance(userId: string): void {
  pricingBalanceCache.delete(userId);
}
