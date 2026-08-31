import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";
import { isValidSnowflake } from "@/lib/api-validation";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; triggerId: string }> }
) {
  try {
    const { guildId, triggerId } = await params;

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
    const response = await botFetch(`/guilds/${guildId}/event-triggers/${triggerId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      userId: session.user?.id,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Failed to update event trigger" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Event triggers PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string; triggerId: string }> }
) {
  try {
    const { guildId, triggerId } = await params;

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

    const response = await botFetch(`/guilds/${guildId}/event-triggers/${triggerId}`, {
      method: "DELETE",
      userId: session.user?.id,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Failed to delete event trigger" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event triggers DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
