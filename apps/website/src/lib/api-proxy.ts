/**
 * Shared proxy handler for bot API routes.
 * Centralizes auth, botFetch, error forwarding, and consistent response shapes.
 */
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";

interface ProxyOptions {
  /** HTTP method */
  method?: string;
  /** If true, skip auth check (for public endpoints) */
  public?: boolean;
  /** Request body for POST/PATCH/PUT */
  body?: unknown;
  /** Override the userId sent to bot API (defaults to session user) */
  userId?: string;
}

/**
 * Safe JSON parse — returns null if the response isn't valid JSON.
 */
async function safeJson(res: Response): Promise<unknown> {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Standard proxy handler for bot API routes.
 * Handles auth, botFetch, error forwarding, and consistent response shape.
 */
export async function botProxy(
  botPath: string,
  options: ProxyOptions = {}
) {
  const { method = "GET", public: isPublic = false, body, userId: overrideUserId } = options;

  try {
    let userId = overrideUserId;

    if (!isPublic) {
      const session = await auth();
      if (!session) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
      userId = userId || session.user?.id;
    }

    const fetchOptions: RequestInit = { method };
    if (body) {
      fetchOptions.headers = { "Content-Type": "application/json" };
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await botFetch(botPath, { ...fetchOptions, userId });
    const data = await safeJson(response);

    if (!response.ok) {
      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as Record<string, unknown>).message)
          : `Bot returned ${response.status}`;
      return NextResponse.json(
        { success: false, error: message },
        { status: response.status }
      );
    }

    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    const isUnreachable =
      error instanceof Error &&
      (error.message.includes("fetch failed") ||
        (error as { cause?: { code?: string } }).cause?.code === "ECONNREFUSED");

    const message = isUnreachable
      ? "Bot service unreachable"
      : error instanceof Error
        ? error.message
        : "Unknown error";

    return NextResponse.json(
      { success: false, error: message },
      { status: isUnreachable ? 503 : 500 }
    );
  }
}
