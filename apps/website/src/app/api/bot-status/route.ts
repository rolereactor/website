import { NextResponse } from "next/server";

const BOT_API_URL = process.env.BOT_API_URL || "http://localhost:3030";

export async function GET() {
  try {
    const response = await fetch(`${BOT_API_URL}/api/v1/bot/status`, {
      method: "GET",
      headers: {
        "User-Agent": `RoleReactorWebsite (${process.env.NEXT_PUBLIC_WEBSITE_URL || "https://rolereactor.xyz"}, 1.0.0)`,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json({ online: false }, { status: 200 });
    }

    const data = await response.json();
    const online = data?.bot?.online ?? false;

    return NextResponse.json(
      { online },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch {
    return NextResponse.json({ online: false }, { status: 200 });
  }
}
