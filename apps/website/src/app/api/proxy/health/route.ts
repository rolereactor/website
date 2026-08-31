import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";

export const dynamic = "force-dynamic";

/**
 * Proxy endpoint for bot health metrics (admin only)
 */
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const response = await botFetch("/api/v1/health");

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch health data from bot API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error while fetching health data" },
      { status: 500 }
    );
  }
}
