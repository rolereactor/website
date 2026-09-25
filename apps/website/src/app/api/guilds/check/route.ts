import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch, isBotUnavailableError } from "@/lib/bot-fetch";

type Session = Awaited<ReturnType<typeof auth>>;

type SessionLike = NonNullable<Session> | { user: { id?: string } };

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
    let session: SessionLike | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token === INTERNAL_API_KEY) {
        // Authorized via internal key, create dummy session
        session = { user: {} };
      } else {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    } else {
      session = await auth();
      if (!session) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    // Ensure the payload always contains a guildIds array (empty if none)
    if (!Array.isArray(body?.guildIds)) {
      body.guildIds = [];
    }
    const userId = session?.user?.id;

    const response = await botFetch("/guilds/check", {
      method: "POST",
      body: JSON.stringify(body),
      userId,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "Failed to check guilds",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Guild check proxy error:", error);
    if (isBotUnavailableError(error)) {
      return NextResponse.json({ success: false, error: "Bot service unreachable" }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
