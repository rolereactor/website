import { NextRequest, NextResponse } from "next/server";
import { botFetch } from "@/lib/bot-fetch";
import { isValidSnowflake } from "@/lib/api-validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const { guildId } = await params;

    if (!isValidSnowflake(guildId)) {
      return NextResponse.json(
        { error: "Invalid guild ID format" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const source = searchParams.get("source");

    const queryParams = new URLSearchParams({ limit });
    if (source) queryParams.set("source", source);

    const response = await botFetch(
      `/guilds/${guildId}/leaderboard?${queryParams.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "Failed to fetch leaderboard",
          hint: errorData.hint,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Guild leaderboard proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
