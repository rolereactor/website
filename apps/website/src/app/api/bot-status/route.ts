import { NextResponse } from "next/server";
import { botFetch } from "@/lib/bot-fetch";

const BOT_API_URL = process.env.BOT_API_URL;

export async function GET() {
  if (!BOT_API_URL) {
    return NextResponse.json({ online: false }, { status: 200 });
  }

  try {
    const response = await botFetch("/api/v1/bot/status", {
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
