import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";
import { sanitizeSearchQuery } from "@/lib/api-validation";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = sanitizeSearchQuery(searchParams.get("q"), 100);

    const response = await botFetch(
      `/guilds/public-leaderboards?q=${encodeURIComponent(q)}`
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch public leaderboards" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
