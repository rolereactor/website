import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";

/**
 * POST /api/user/referral/claim
 * Claims a referral code for the logged-in user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body: { code?: string } = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { code } = body;
    const cleanCode = typeof code === "string" ? code.trim().toUpperCase() : "";
    if (!cleanCode || !/^RR-[A-Z0-9]{6}$/.test(cleanCode)) {
      return NextResponse.json(
        { success: false, error: "Invalid referral code format. Code must be in format RR-XXXXXX." },
        { status: 400 }
      );
    }

    const response = await botFetch("/user/referral/claim", {
      method: "POST",
      userId,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: cleanCode }),
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
          error: (data.message as string) || (data.error as string) || "Failed to claim referral code",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    const err = error as Error;
    console.error("Referral claim error:", err);
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
