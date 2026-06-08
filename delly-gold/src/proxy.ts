import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes (UI)
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "ADMIN") {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }

    // Inject user info into headers for server components
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    // Exclude static files and api routes from middleware (API routes handle their own auth)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
