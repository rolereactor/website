import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPricingBalance } from "@/lib/server/balance";
import { isBotUnavailableError } from "@/lib/bot-fetch";

/**
 * Pricing-flavored balance for the authenticated user
 * (first-purchase flags, credits, sparks).
 * Cached server-side (90s fresh + stale-while-revalidate) by lib/server/balance.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userData = await getPricingBalance(session.user.id);
    return NextResponse.json({ success: true, data: { user: userData } });
  } catch (error) {
    const err = error as Error;
    if (isBotUnavailableError(err)) {
      return NextResponse.json(
        { success: false, error: "Bot service unreachable" },
        { status: 503 }
      );
    }
    if (err.message === "Unexpected pricing balance response shape") {
      return NextResponse.json(
        { success: false, error: "Invalid response format" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch balance" },
      { status: 500 }
    );
  }
}
