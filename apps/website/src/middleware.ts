import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const refCode = nextUrl.searchParams.get("ref");

  // Protect all dashboard routes
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

  let response = NextResponse.next();
  if (isDashboardRoute && !isLoggedIn) {
    response = NextResponse.redirect(new URL("/", nextUrl));
  }

  const REFERRAL_CODE_PATTERN = /^RR-[A-Z0-9]{6}$/;
  const normalizedRef = refCode?.trim().toUpperCase();
  if (normalizedRef && REFERRAL_CODE_PATTERN.test(normalizedRef)) {
    response.cookies.set("rr_ref_code", normalizedRef, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
});

// Optionally, don't run middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
