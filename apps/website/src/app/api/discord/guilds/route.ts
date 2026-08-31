import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { DiscordGuild } from "@/types/discord";

interface AuthSession {
  user: { id: string };
  accessToken: string;
}

const GUILD_CACHE = new Map<
  string,
  { data: DiscordGuild[]; expires: number }
>();

export async function GET() {
  const session = await auth();

  if (!session) {
    console.error("No session found in /api/discord/guilds");
    return NextResponse.json(
      { error: "Unauthorized: No Session" },
      { status: 401 }
    );
  }

  const accessToken = (session as AuthSession).accessToken;
  if (!accessToken) {
    console.warn(
      `[API] No access token found in session for user: ${session.user?.id}.`
    );
    return NextResponse.json([]);
  }

  const now = Date.now();
  const cached = GUILD_CACHE.get(accessToken);
  if (cached && cached.expires > now) {
    return NextResponse.json(cached.data);
  }

  try {
    const response = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "User-Agent": `RoleReactorWebsite (${process.env.NEXT_PUBLIC_WEBSITE_URL || "https://rolereactor.xyz"}, 1.0.0)`,
      },
      next: { revalidate: 60 }, // Reduce next cache to favor our in-memory cache for debugging
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No body");
      console.error(
        `[Discord API Error] Status: ${response.status} | User: ${session.user?.id} | Body: ${errorText}`
      );

      if (response.status === 429) {
        return NextResponse.json(cached?.data || []);
      }

      // If we get a 401, it means the token is invalid or missing scope
      return NextResponse.json(
        {
          error: "Unauthorized access to Discord guilds",
          code: "DISCORD_UNAUTHORIZED",
          status: response.status,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const allGuilds = await response.json();

    // Filter for servers where user is an OWNER, ADMIN, or has MANAGE_GUILD
    const manageableGuilds = allGuilds.filter((guild: DiscordGuild) => {
      const permissions = BigInt(guild.permissions || "0");
      const isAdmin = (permissions & BigInt(0x8)) === BigInt(0x8);
      const canManage = (permissions & BigInt(0x20)) === BigInt(0x20);

      return guild.owner === true || isAdmin || canManage;
    });

    // Populate in-memory cache for 2 minutes
    GUILD_CACHE.set(accessToken, {
      data: manageableGuilds,
      expires: Date.now() + 120000,
    });

    console.log(
      `[Discord API] Success: Fetched ${manageableGuilds.length} manageable guilds for ${session.user?.id}`
    );
    return NextResponse.json(manageableGuilds);
  } catch (error: unknown) {
    console.error("[Discord API Exception] Internal Server Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", message },
      { status: 500 }
    );
  }
}
