import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /overlay/verify/:guildId/:widget?token=xxx
 *
 * Proxies token verification to the bot API.
 * OBS browser sources load this page directly, so we need to proxy the verification.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ guildId: string; widget: string }> },
) {
  const { guildId, widget } = await params;
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });
  }

  try {
    const botApiUrl = process.env.BOT_API_URL;
    const internalKey = process.env.INTERNAL_API_KEY;

    if (!botApiUrl) {
      return NextResponse.json({ valid: false, error: "Bot API not configured" }, { status: 500 });
    }

    const verifyUrl = `${botApiUrl}/overlay/verify/${guildId}/${widget}?token=${token}`;
    const response = await fetch(verifyUrl, {
      headers: {
        ...(internalKey && { Authorization: `Bearer ${internalKey}` }),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Overlay verify proxy error:", error);
    return NextResponse.json({ valid: false, error: "Verification failed" }, { status: 500 });
  }
}
