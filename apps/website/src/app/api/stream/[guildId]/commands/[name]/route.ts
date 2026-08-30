import { NextRequest } from "next/server";
import { streamProxy } from "../../../_lib/proxy";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; name: string }> }
) {
  const { guildId, name } = await params;
  const body = await request.json().catch(() => ({}));
  return streamProxy(
    "PATCH",
    guildId,
    `/stream/guilds/${guildId}/commands/${name}`,
    body
  );
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string; name: string }> }
) {
  const { guildId, name } = await params;
  return streamProxy(
    "DELETE",
    guildId,
    `/stream/guilds/${guildId}/commands/${name}`
  );
}
