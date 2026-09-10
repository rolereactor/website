import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";
import { isValidSnowflake } from "@/lib/api-validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const { guildId } = await params;

  if (!isValidSnowflake(guildId)) {
    return NextResponse.json(
      { error: "Invalid guild ID format" },
      { status: 400 }
    );
  }

  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const username = request.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json(
      { success: false, error: "Missing username parameter" },
      { status: 400 }
    );
  }

  const userId = session.user?.id;

  const response = await botFetch(
    `/stream/guilds/${guildId}/verify-mod?username=${username}`,
    { method: "GET", userId }
  );

  const text = await response.text();
  let data: Record<string, unknown> | null = null;
  try {
    if (text) data = JSON.parse(text);
  } catch {
    // not JSON
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as Record<string, unknown>).message)
        : `Bot returned ${response.status}`;
    return NextResponse.json(
      { success: false, error: message },
      { status: response.status }
    );
  }

  return NextResponse.json(data ?? { success: true });
}
