import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/adminAuth";

/**
 * The auth gate. Everything under /admin and /api/admin requires a valid
 * session cookie — except the login page/endpoint. API callers get a 401;
 * page requests are redirected to the login screen.
 */
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const authorized = await verifySession(req.cookies.get(ADMIN_COOKIE)?.value);
  if (authorized) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const login = new URL("/admin/login", req.url);
  login.searchParams.set("from", pathname);
  return NextResponse.redirect(login);
}
