import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isAdminEmail } from "@/lib/admin/adminEmails";

/**
 * First line of defence for the Host/admin panel.
 * Every admin page and admin API route is also re-checked server-side
 * (layout + requireAdmin), so this is defence in depth, not the only gate.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const email = (token?.email as string | undefined) || undefined;
  const allowed = isAdminEmail(email);

  if (allowed) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json(
      { error: email ? "This account is not an administrator" : "Not signed in" },
      { status: email ? 403 : 401 }
    );
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = email ? "?error=not_admin" : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
