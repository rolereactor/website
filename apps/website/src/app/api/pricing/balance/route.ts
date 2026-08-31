import { NextRequest, NextResponse } from "next/server";
import { botFetch } from "@/lib/bot-fetch";

/**
 * Real-time Core balance for a user.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing user_id" },
        { status: 400 }
      );
    }

    const response = await botFetch(`/pricing?user_id=${userId}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Bot API returned ${response.status}`);
    }

    const data = await response.json();

    // Extract and normalize user data - API returns "requestedUserId" but schema expects "userId"
    let userData = null;
    if (data.success && data.data?.user) {
      const rawCredits = data.data.user.currentCredits;
      // Fix floating point precision issue from bot API
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

    if (data.status === "success" && data.user) {
      const rawCredits = data.user.currentCredits;
      // Fix floating point precision issue from bot API
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

    throw new Error("Invalid response format from Bot API");
  } catch (error) {
    console.error("Error fetching pricing balance:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Pricing service is currently unavailable. Please try again later.",
      },
      { status: 503 }
    );
  }
}
