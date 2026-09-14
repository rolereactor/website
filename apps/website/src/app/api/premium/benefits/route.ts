import { NextResponse } from "next/server";
import { botFetch } from "@/lib/bot-fetch";

export async function GET() {
  try {
    const response = await botFetch("/premium/benefits");

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch premium benefits" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Premium benefits proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
