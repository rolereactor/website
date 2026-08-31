import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
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

    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "6";
    const userId = session.user?.id;

    const response = await botFetch(
      `/guilds/${guildId}/role-reactions?page=${page}&limit=${limit}`,
      { userId }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "Failed to fetch role mappings from bot",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data || { roleMappings: [] }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Guild role mappings proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
