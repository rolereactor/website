import { NextResponse } from "next/server";

/**
 * Health check endpoint for monitoring and uptime tracking
 * Returns system status, version, and basic metrics
 */

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: { status: "ok" | "error"; latency?: number };
    discord: { status: "ok" | "error"; latency?: number };
    botApi: { status: "ok" | "error"; latency?: number };
  };
  environment: string;
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthResponse["checks"] = {
    database: { status: "ok" as const },
    discord: { status: "ok" as const },
    botApi: { status: "ok" as const },
  };

  let status: HealthResponse["status"] = "healthy";

  // Check Discord API
  try {
    const discordStart = Date.now();
    const discordResponse = await fetch("https://discord.com/api/v10/gateway", {
      method: "GET",
      headers: {
        "User-Agent": `RoleReactorWebsite (${process.env.NEXT_PUBLIC_WEBSITE_URL || "https://rolereactor.xyz"}, 1.0.0)`,
      },
    });
    const discordLatency = Date.now() - discordStart;

    if (!discordResponse.ok) {
      checks.discord = { status: "error", latency: discordLatency };
      status = "degraded";
    } else {
      checks.discord = { status: "ok", latency: discordLatency };
    }
  } catch {
    checks.discord = { status: "error" };
    status = "degraded";
  }

  // Check Bot API
  try {
    const botApiStart = Date.now();
    const botApiUrl = process.env.BOT_API_URL;
    if (botApiUrl) {
      const botResponse = await fetch(`${botApiUrl}/health`, {
        method: "GET",
        headers: {
          "User-Agent": `RoleReactorWebsite (${process.env.NEXT_PUBLIC_WEBSITE_URL || "https://rolereactor.xyz"}, 1.0.0)`,
        },
      });
      const botLatency = Date.now() - botApiStart;

      if (!botResponse.ok) {
        checks.botApi = { status: "error", latency: botLatency };
        status = "degraded";
      } else {
        checks.botApi = { status: "ok", latency: botLatency };
      }
    }
  } catch {
    checks.botApi = { status: "error" };
    status = "degraded";
  }

  // Calculate uptime
  const uptime = process.uptime();

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.1.0",
    uptime,
    checks,
    environment: process.env.NODE_ENV || "production",
  };

  return NextResponse.json(response, {
    status: status === "healthy" ? 200 : status === "degraded" ? 206 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Response-Time": `${Date.now() - startTime}ms`,
    },
  });
}
