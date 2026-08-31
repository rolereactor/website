import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";
import { isValidSnowflake } from "@/lib/api-validation";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const { guildId } = await params;

    if (!isValidSnowflake(guildId)) {
      return NextResponse.json(
        { error: "Invalid guild ID format" },
        { status: 400 }
      );
    }

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await botFetch(`/guilds/${guildId}/variables`, {
      userId: session.user?.id,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Failed to fetch variables" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Variables GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const { guildId } = await params;

    if (!isValidSnowflake(guildId)) {
      return NextResponse.json(
        { error: "Invalid guild ID format" },
        { status: 400 }
      );
    }

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const response = await botFetch(`/guilds/${guildId}/variables`, {
      method: "POST",
      body: JSON.stringify({ ...body, createdBy: session.user?.id }),
      userId: session.user?.id,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Failed to create variable" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Variables POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
