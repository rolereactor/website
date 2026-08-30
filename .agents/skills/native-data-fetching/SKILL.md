---
name: native-data-fetching
description: Use when implementing or debugging ANY network request, API call, or data fetching in Next.js. Covers fetch API, API route proxies, defensive response parsing, error handling, caching, and microservice error recovery.
version: 2.0.0
license: MIT
---

# Web & Next.js Data Fetching Guidelines

**Use this skill for ANY networking work in this Next.js codebase including API routes, proxy handlers, client stores, error handling, and microservice connectivity.**

## Core Principles

1. **Defensive Response Parsing**:
   - Always read `response.text()` before calling `JSON.parse()` in client stores and proxy handlers.
   - Never invoke `.json()` directly on raw fetch response objects without try/catch protection to prevent `SyntaxError` crashes when backend error responses return non-JSON HTML (404/500/503).

2. **Upstream Microservice Unreachability Handling (`ECONNREFUSED`)**:
   - In Next.js API proxy routes, catch Node.js fetch failures (`code: 'ECONNREFUSED'` / `"fetch failed"`).
   - Return HTTP 503 (`"Bot service unreachable"`) instead of leaking raw unhandled exceptions or returning generic 500 status codes.

3. **Avoid Third-Party Wrapper Libraries**:
   - Prefer native `fetch` over `axios`. Next.js extends native `fetch` with caching, revalidation, and server-side request deduplication out-of-the-box.

---

## Code Patterns & Examples

### 1. Defensive Client-Side Fetch (Zustand / Helper)

```ts
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const text = await res.text();
  let data: Record<string, unknown> | null = null;

  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    data = null;
  }

  if (!res.ok || (data && (data.status === "error" || data.success === false))) {
    const errorMsg =
      (data?.error as string) || (data?.message as string) || `Request failed (${res.status})`;
    throw new Error(errorMsg);
  }

  if (!data) {
    throw new Error("Empty or invalid response from server");
  }

  return data as T;
}
```

---

### 2. Next.js API Proxy Route Handler

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetch } from "@/lib/bot-fetch";

export async function streamProxy(
  method: string,
  guildId: string,
  botPath: string,
  body?: unknown
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user?.id;
    const fetchOptions: RequestInit = { method };
    if (body) {
      fetchOptions.headers = { "Content-Type": "application/json" };
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await botFetch(botPath, { ...fetchOptions, userId });
    
    // Read text safely to prevent JSON.parse crashes
    const text = await response.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as Record<string, unknown>).message)
          : `Bot returned ${response.status}`;
      return NextResponse.json(
        { success: false, error: message },
        { status: response.status }
      );
    }

    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    console.error(`Stream proxy error [${method} ${botPath}]:`, error);
    
    // Detect upstream ECONNREFUSED
    const isUnreachable =
      error instanceof Error &&
      (error.message.includes("fetch failed") ||
        (error as { cause?: { code?: string } }).cause?.code === "ECONNREFUSED");

    const message = isUnreachable
      ? "Bot service unreachable"
      : error instanceof Error
        ? error.message
        : "Unknown error";

    return NextResponse.json(
      { success: false, error: message },
      { status: isUnreachable ? 503 : 500 }
    );
  }
}
```

---

### 3. Server Component Data Fetching

```ts
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function getManageableGuilds() {
  const session = await auth();
  if (!session?.accessToken) {
    redirect("/api/auth/signin");
  }

  const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!res.ok) {
    throw new Error(`Discord API error: ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : [];
}
```

---

## Common Pitfalls to Avoid

❌ **Direct `.json()` without try/catch**:
```ts
// Bad: crashes with SyntaxError if endpoint returns 502/504 HTML page
const data = await response.json();
```

✅ **Read `.text()` first**:
```ts
// Good: handles empty/HTML responses safely
const text = await response.text();
const data = text ? JSON.parse(text) : null;
```

❌ **Swallowing connection refusal**:
```ts
// Bad: returns generic 500 error, leaving user confused
catch (err) { return NextResponse.json({ error: "Internal Error" }, { status: 500 }); }
```

✅ **Classify ECONNREFUSED**:
```ts
// Good: gives actionable feedback when local backend service is offline
catch (err) {
  const isOffline = err.message.includes("fetch failed");
  return NextResponse.json({ error: isOffline ? "Bot service unreachable" : err.message }, { status: isOffline ? 503 : 500 });
}
```
