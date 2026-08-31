import { NextRequest, NextResponse } from "next/server";
import { streamProxy } from "../../_lib/proxy";
import { isValidSnowflake } from "@/lib/api-validation";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const { guildId } = await params;

  if (!isValidSnowflake(guildId)) {
    return NextResponse.json(
      { error: "Invalid guild ID format" },
      { status: 400 }
    );
  }

  return streamProxy("GET", guildId, `/stream/guilds/${guildId}/config`);
}

export async function PATCH(
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

  const body = await request.json().catch(() => ({}));
  return streamProxy(
    "PATCH",
    guildId,
    `/stream/guilds/${guildId}/config`,
    body
  );
}
