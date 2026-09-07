import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";
import { rateLimiters, getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const { allowed, headers } = rateLimiters.payments.middleware(ip);

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: { message: "Rate limit exceeded", code: 429 } },
      { status: 429, headers }
    );
  }

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
    const userEmail = session.user.email;
    const username = session.user.name;

    const body = await request.json();
    const { txHash, packageId, chainId, senderAddress } = body;

    if (!txHash) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Transaction hash is required`,
            code: 400,
          },
        },
        { status: 400 }
      );
    }

    const botResponse = await botFetch("/payments/web3/verify", {
      method: "POST",
      userId,
      body: JSON.stringify({
        txHash,
        packageId,
        chainId,
        senderAddress,
        discordId: userId,
        email: userEmail,
        username: username,
      }),
    });

    if (!botResponse.ok) {
      const errorText = await botResponse.text();
      let errorMessage = "Failed to verify payment";

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText.substring(0, 200);
      }

      return NextResponse.json(
        {
          success: false,
          error: { message: errorMessage, code: botResponse.status },
        },
        { status: botResponse.status }
      );
    }

    const botData = await botResponse.json();

    return NextResponse.json({
      success: true,
      data: botData,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Internal server error verifying payment",
          code: 500,
        },
      },
      { status: 500 }
    );
  }
}
