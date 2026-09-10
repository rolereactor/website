import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch, isBotUnavailableError } from "@/lib/bot-fetch";

/**
 * Real-time Core balance for the authenticated user.
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

    const userId = session.user.id;

    const response = await botFetch(`/pricing?user_id=${userId}`, {
      method: "GET",
      cache: "no-store",
      userId,
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch balance" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract and normalize user data
    let userData = null;
    if (data.success && data.data?.user) {
      const rawCredits = data.data.user.currentCredits;
      const fixedCredits = rawCredits
        ? Number(Number(rawCredits).toFixed(2))
        : 0;
      const fixedSparks = Number(
        Number(data.data.user.sparks ?? 0).toFixed(2)
      );
      userData = {
        userId: data.data.user.requestedUserId,
        isFirstPurchase: data.data.user.isFirstPurchase,
        currentCredits: fixedCredits,
        sparks: fixedSparks,
        eligibleForFirstPurchaseBonus:
          data.data.user.eligibleForFirstPurchaseBonus,
      };
    }

    if ((data.status === "success" || data.success === true) && data.user) {
      const rawCredits = data.user.currentCredits;
      const fixedCredits = rawCredits
        ? Number(Number(rawCredits).toFixed(2))
        : 0;
      const fixedSparks = Number(Number(data.user.sparks ?? 0).toFixed(2));
      userData = {
        userId: data.user.requestedUserId,
        isFirstPurchase: data.user.isFirstPurchase,
        currentCredits: fixedCredits,
        sparks: fixedSparks,
        eligibleForFirstPurchaseBonus: data.user.eligibleForFirstPurchaseBonus,
      };
    }

    if (userData) {
      return NextResponse.json({ success: true, data: { user: userData } });
    }

    return NextResponse.json(
      { success: false, error: "Invalid response format" },
      { status: 500 }
    );
  } catch (error) {
    const err = error as Error;
    if (isBotUnavailableError(err)) {
      return NextResponse.json(
        { success: false, error: "Bot service unreachable" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch balance" },
      { status: 500 }
    );
  }
}
