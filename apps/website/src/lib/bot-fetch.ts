import "server-only";
import { getBotApiUrl } from "./api-config";

interface BotFetchOptions extends RequestInit {
  silent?: boolean;
  userId?: string;
}

/**
 * Returns true for errors that mean the bot service is down/unreachable:
 * connection refused, fetch failure, or request timeout.
 */
export function isBotUnavailableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const name = (err as { name?: string }).name ?? "";
  const msg = err.message ?? "";
  return (
    name === "TimeoutError" ||
    name === "AbortError" ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("fetch failed") ||
    msg.includes("aborted")
  );
}

/**
 * Bot API Fetcher
 * Centralized utility to handle authorized requests from website to bot.
 * Returns the raw Response object.
 */
export async function botFetch(
  path: string,
  options: BotFetchOptions = {}
): Promise<Response> {
  const botApiUrl = process.env.BOT_API_URL;
  const internalKey = process.env.INTERNAL_API_KEY;
  const { userId, ...fetchOptions } = options;

  // Use fallback for local dev if env not set
  if (!botApiUrl) {
    throw new Error("BOT_API_URL is not defined");
  }
  const apiUrl = botApiUrl;
  const apiKey = internalKey;

  if (!apiKey && process.env.NODE_ENV === "development") {
    console.warn(
      `[botFetch Warning] INTERNAL_API_KEY is missing. Requests to ${path} might fail authorized checks on the bot.`
    );
  }

  const versionedPath = getBotApiUrl(path);
  const url = `${apiUrl}${versionedPath}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
    ...(userId && { "X-User-ID": userId }),
    ...(fetchOptions.headers as Record<string, string>),
  };

  const signal = fetchOptions.signal || AbortSignal.timeout(30000);

  return fetch(url, {
    ...fetchOptions,
    headers,
    signal,
  });
}

/**
 * Strategic wrapper for botFetch that handles JSON parsing and error status automatically.
 * Useful for easy data fetching in Server Components or Background Tasks.
 *
 * @example
 * const settings = await botFetchJson<GuildSettings>(`/guilds/${id}/settings`);
 */
export async function botFetchJson<T>(
  path: string,
  options: BotFetchOptions = {}
): Promise<T> {
  const { silent, ...fetchOptions } = options;
  const response = await botFetch(path, fetchOptions);

  if (!response.ok) {
    let errorData: Record<string, unknown> = {};
    try {
      errorData = await response.json();
    } catch {
      // Body might be empty or not JSON
    }

    const message =
      (errorData.message as string) ||
      (errorData.error as string) ||
      `Bot API returned ${response.status} for ${path}`;

    if (!silent && process.env.NODE_ENV !== "test") {
      console.error(`[botFetchJson Error] ${message}`, {
        status: response.status,
        path,
        errorData,
      });
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
