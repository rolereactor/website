import { NextRequest } from "next/server";
import { streamProxy } from "../../_lib/proxy";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const { guildId } = await params;
  return streamProxy("GET", guildId, `/stream/guilds/${guildId}/quotes`);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const { guildId } = await params;
  const body = await request.json().catch(() => ({}));
  return streamProxy("POST", guildId, `/stream/guilds/${guildId}/quotes`, body);
}
