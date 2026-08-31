import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const internalKey = process.env.INTERNAL_API_KEY;
  if (!internalKey) {
    return NextResponse.json(
      { success: false, error: "Internal API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await botFetch("/api/v1/config", {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Bot API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to connect to bot API" },
      { status: 502 }
    );
  }
}
