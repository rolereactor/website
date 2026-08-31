import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";
import { isValidSnowflake } from "@/lib/api-validation";

export async function GET(
  _request: NextRequest,
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

    const userId = session.user?.id;
    const response = await botFetch(`/guilds/${guildId}/details`, { userId });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error:
            errorData.message ||
            errorData.error ||
            "Failed to fetch guild details",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Guild details proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
