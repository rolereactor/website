import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";

/**
 * GET /api/user/referral
 * Returns referral code, share URL, referral stats, and referral history
 */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const response = await botFetch("/user/referral", {
      method: "GET",
      userId,
    });

    const responseText = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid API response" },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: (data.message as string) || (data.error as string) || "Failed to fetch referral data",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    const err = error as Error;
    console.error("Referral fetch error:", err);
    if (err.message?.includes("ECONNREFUSED") || err.message?.includes("fetch failed")) {
      return NextResponse.json(
        { success: false, error: "Bot service unreachable" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
