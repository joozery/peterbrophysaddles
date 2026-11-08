import { type NextRequest, NextResponse } from "next/server";

// Optimistic check only: no session cookie → go to the sign-in page. Real authorisation happens in every
// /api/admin route (see src/lib/server/auth.ts), so a forged cookie still gets nothing.
export function proxy(request: NextRequest) {
  if (request.cookies.has("pb_admin")) return NextResponse.next();
  const url = new URL("/admin/login", request.url);
  if (request.nextUrl.pathname !== "/admin") url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin", "/admin/((?!login).*)"] };
