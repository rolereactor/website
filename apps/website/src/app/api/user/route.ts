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
    const rawLimit = searchParams.get("limit") || "50";
    const rawPage = searchParams.get("page") || "1";
    const search = searchParams.get("search");

    const limitNum = Math.max(1, Math.min(100, parseInt(rawLimit, 10) || 50));
    const pageNum = Math.max(1, parseInt(rawPage, 10) || 1);

    const query = new URLSearchParams({
      limit: String(limitNum),
      page: String(pageNum),
      ...(search && { search }),
    });

    const data = await botFetchJson<UsersResponse>(
      `/user?${query.toString()}`,
      { userId, silent: true }
    );

    if (data?.users && Array.isArray(data.users)) {
      const rawCount = data.users.length;

      const seen = new Set<string>();
      const uniqueUsers = data.users.filter((u) => {
        if (!u.id || seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
      });

      // Check if backend injected an extra user beyond limit
      const hasInjectedUser = rawCount > limitNum || uniqueUsers.length > limitNum;
      data.users = uniqueUsers.slice(0, limitNum);

      // Normalize pagination metadata so total count is accurate
      if (data.pagination && hasInjectedUser && data.pagination.total > 0) {
        const realTotal = data.pagination.total - 1;
        data.pagination.total = realTotal;
        data.pagination.pages = Math.ceil(realTotal / limitNum);
      }
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      users: [],
      pagination: { page: 1, total: 0, pages: 0 },
    });
  }
}
