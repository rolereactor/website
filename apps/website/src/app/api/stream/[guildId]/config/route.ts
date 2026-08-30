import { NextRequest } from "next/server";
import { streamProxy } from "../../_lib/proxy";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const { guildId } = await params;
  return streamProxy("GET", guildId, `/stream/guilds/${guildId}/config`);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const { guildId } = await params;
  const body = await request.json().catch(() => ({}));
  return streamProxy(
    "PATCH",
    guildId,
    `/stream/guilds/${guildId}/config`,
    body
  );
}
