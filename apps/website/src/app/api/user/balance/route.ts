import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCoreBalance } from "@/lib/server/balance";
import { rateLimiters, getClientIP } from "@/lib/rate-limit";

/**
 * Proxy user balance requests to the bot API.
 * Cached server-side (90s fresh + stale-while-revalidate) by lib/server/balance.
 */
export async function GET(request: Request) {
  const ip = getClientIP(request);
  const { allowed, headers } = rateLimiters.api.middleware(ip);

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded" },
      { status: 429, headers }
    );
  }

  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: true, balance: 0 }, { status: 200 });
    }

    const result = await getCoreBalance(userId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      success: true,
      balance: 0,
      cores: 0,
      sparks: 0,
    });
  }
}
