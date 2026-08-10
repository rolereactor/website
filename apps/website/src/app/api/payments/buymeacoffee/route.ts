import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";

export async function POST(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Authentication required", code: 401 },
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const botResponse = await botFetch("/payments/buymeacoffee/generate-code", {
      method: "POST",
      userId,
      body: JSON.stringify({ discordId: userId }),
    });

    const botData = await botResponse.json();

    if (!botResponse.ok) {
      const errorMessage =
        botData.message || botData.error || "Failed to generate code";
      return NextResponse.json(
        {
          success: false,
          error: { message: errorMessage, code: botResponse.status },
        },
        { status: botResponse.status }
      );
    }

    // Get username from session for display
    const username = session.user.name || "Unknown";

    return NextResponse.json({
      success: true,
      data: {
        ...botData.data,
        username,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to generate code", code: 500 },
      },
      { status: 500 }
    );
  }
}
