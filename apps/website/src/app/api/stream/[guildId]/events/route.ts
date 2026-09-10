import { auth } from "@/auth";
import { getBotApiUrl } from "@/lib/api-config";

export const dynamic = "force-dynamic";

/**
 * GET /api/stream/:guildId/events — SSE proxy route
 *
 * Proxies Server-Sent Events from the bot API to the browser.
 * Supports two auth methods:
 * - Session auth (for dashboard)
 * - Token auth (for OBS overlays via ?token=xxx)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  // Validate guildId
  if (!/^\d{17,20}$/.test(guildId)) {
    return new Response(
      JSON.stringify({ status: "error", message: "Invalid guild ID" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Auth check: session OR token
  let userId: string | null = null;

  if (token) {
    // Token auth for overlays — verify token is valid
    try {
      const botApiUrl = process.env.BOT_API_URL;
      const internalKey = process.env.INTERNAL_API_KEY;
      const verifyUrl = `${botApiUrl}/overlay/verify/${guildId}/alerts?token=${token}`;
      const verifyRes = await fetch(verifyUrl, {
        headers: {
          ...(internalKey && { Authorization: `Bearer ${internalKey}` }),
        },
      });
      if (!verifyRes.ok) {
        return new Response(
          JSON.stringify({ status: "error", message: "Invalid overlay token" }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }
      // Token is valid, use a system user ID for the bot SSE connection
      userId = "overlay-viewer";
    } catch {
      return new Response(
        JSON.stringify({ status: "error", message: "Token verification failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  } else {
    // Session auth for dashboard
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ status: "error", message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    userId = session.user.id;
  }

  const botApiUrl = process.env.BOT_API_URL;
  const internalKey = process.env.INTERNAL_API_KEY;

  if (!botApiUrl) {
    return new Response(
      JSON.stringify({ status: "error", message: "Bot API not configured" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  // Build bot API SSE URL
  const botSseUrl = `${botApiUrl}${getBotApiUrl(`/events/${guildId}`)}`;

  try {
    // Forward to bot API SSE endpoint
    const botResponse = await fetch(botSseUrl, {
      headers: {
        Authorization: `Bearer ${internalKey}`,
        "X-User-ID": userId,
        Accept: "text/event-stream",
      },
    });

    if (!botResponse.ok) {
      const errorBody = await botResponse.text().catch(() => "");
      return new Response(errorBody || `Bot API returned ${botResponse.status}`, {
        status: botResponse.status,
        headers: { "Content-Type": "text/event-stream" },
      });
    }

    // Stream the SSE response back to the client
    const reader = botResponse.body?.getReader();
    if (!reader) {
      return new Response("No response body from bot API", { status: 502 });
    }

    let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

    const stream = new ReadableStream({
      async start(controller) {
        // Send keepalive every 15s to prevent proxy/browser timeouts
        keepAliveInterval = setInterval(() => {
          try {
            controller.enqueue(
              new TextEncoder().encode(":keepalive\n\n"),
            );
          } catch {
            // Stream already closed
          }
        }, 15_000);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (err) {
          controller.error(err);
        } finally {
          if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
            keepAliveInterval = null;
          }
          controller.close();
        }
      },
      cancel() {
        if (keepAliveInterval) {
          clearInterval(keepAliveInterval);
          keepAliveInterval = null;
        }
        reader.cancel();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error(`SSE proxy error for guild ${guildId}:`, error);
    const isUnreachable =
      error instanceof Error &&
      (error.message.includes("fetch failed") ||
        (error as { cause?: { code?: string } }).cause?.code === "ECONNREFUSED");

    return new Response(
      JSON.stringify({
        status: "error",
        message: isUnreachable ? "Bot service unreachable" : "SSE proxy failed",
      }),
      {
        status: isUnreachable ? 503 : 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
