import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";
import { rateLimiters, getClientIP } from "@/lib/rate-limit";

const MINIMUM_PAYMENT = 1;

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
    const { amount, packageId, currency } = body;

    if (!amount || typeof amount !== "number" || amount < MINIMUM_PAYMENT) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Amount must be at least $${MINIMUM_PAYMENT}`,
            code: 400,
          },
        },
        { status: 400 }
      );
    }

    const botResponse = await botFetch("/payments/create", {
      method: "POST",
      userId,
      body: JSON.stringify({
        amount,
        packageId,
        currency,
        discordId: userId,
        email: userEmail,
        username: username,
      }),
    });

    if (!botResponse.ok) {
      const errorText = await botResponse.text();
      let errorMessage = "Failed to create payment";

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
    const responseData = botData.data || botData.response || botData;
    const invoiceUrl = responseData?.invoiceUrl || responseData?.paymentUrl;
    const isSuccess = botData.success === true || botData.status === "success";

    if (!isSuccess || !invoiceUrl) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Failed to create payment invoice", code: 500 },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        invoiceUrl,
        paymentUrl: invoiceUrl,
        orderId: responseData.orderId,
        amount: responseData.amount || amount,
        currency: responseData.currency || "USD",
        packageId: responseData.packageId || packageId,
        user: responseData.user || {
          discordId: userId,
          username,
          emailPrefilled: true,
        },
        message: responseData.message,
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to create payment", code: 500 },
      },
      { status: 500 }
    );
  }
}
