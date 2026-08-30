import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";

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
 * Shared proxy handler for Live Reactor API routes.
 * Handles auth, botFetch, error forwarding, and JSON safety.
 */
export async function streamProxy(
  method: string,
  guildId: string,
  botPath: string,
  body?: unknown
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user?.id;

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
    console.error(`Stream proxy error [${method} ${botPath}]:`, error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
