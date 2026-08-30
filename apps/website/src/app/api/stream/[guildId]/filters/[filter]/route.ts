import { NextRequest } from "next/server";
import { streamProxy } from "../../../_lib/proxy";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; filter: string }> }
) {
  const { guildId, filter } = await params;
  const body = await request.json().catch(() => ({}));
  return streamProxy(
    "PATCH",
    guildId,
    `/stream/guilds/${guildId}/filters/${filter}`,
    body
  );
}
