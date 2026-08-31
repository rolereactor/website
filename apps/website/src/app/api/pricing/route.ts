import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";

/**
 * Get Core credit packages and pricing from the bot API
 * Requires authentication — uses session user ID for personalized pricing
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

    // Call bot API to get pricing with authenticated user
    const response = await botFetch(`/pricing?user_id=${userId}`, {
      method: "GET",
      cache: "no-store",
      userId,
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Pricing service unavailable" },
        { status: 503 }
      );
    }

    const data = await response.json();

    // Handle bot's response format (either success: true with data envelope OR status: success with spread data)
    if (data.success && data.data) {
      return NextResponse.json({
        success: true,
        data: data.data,
      });
    }

    if (data.status === "success") {
      const { status: _, timestamp: __, ...pricingInfo } = data;
      return NextResponse.json({
        success: true,
        data: pricingInfo,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid response format" },
      { status: 500 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Pricing service is currently unavailable" },
      { status: 503 }
    );
  }
}
