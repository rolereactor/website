import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetchJson } from "@/lib/bot-fetch";
import { rateLimiters, getClientIP } from "@/lib/rate-limit";

interface UserData {
  id: string;
  username: string;
  globalName: string;
  avatar: string | null;
  role: string;
  credits: number;
  lastLogin: string;
  createdAt: string;
  isPayer?: boolean;
}

interface UsersResponse {
  users: UserData[];
  pagination: {
    page: number;
    total: number;
    pages: number;
  };
}

export async function GET(request: Request) {
  const ip = getClientIP(request);
  const { allowed, headers } = rateLimiters.api.middleware(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers }
    );
  }

  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const page = searchParams.get("page") || "1";
    const search = searchParams.get("search");

    const query = new URLSearchParams({
      limit,
      page,
      ...(search && { search }),
    });

    const data = await botFetchJson<UsersResponse>(
      `/user?${query.toString()}`,
      { userId, silent: true }
    );

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      users: [],
      pagination: { page: 1, total: 0, pages: 0 },
    });
  }
}
