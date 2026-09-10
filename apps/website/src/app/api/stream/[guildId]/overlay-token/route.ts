import { NextResponse } from "next/server";
import { streamProxy } from "../../_lib/proxy";

export const dynamic = "force-dynamic";

/**
 * POST /api/stream/:guildId/overlay-token — Generate overlay URL
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  if (!/^\d{17,20}$/.test(guildId)) {
    return NextResponse.json(
      { success: false, error: "Invalid guild ID" },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => ({}));
  return streamProxy("POST", guildId, `/stream/guilds/${guildId}/overlay-token`, body);
}
