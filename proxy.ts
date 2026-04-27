import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

const protectedRoutes = ["/dashboard", "/admin", "/courses/.* /learn/.*"];
const adminRoutes = ["/admin"];

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => new RegExp(`^${route}`).test(path));
  const isAdminRoute = adminRoutes.some((route) => new RegExp(`^${route}`).test(path));

  if (!isProtectedRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const session = request.cookies.get("session")?.value;
  const decodedSession = session ? await decrypt(session).catch(() => null) : null;

  if (isProtectedRoute && !decodedSession) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (isAdminRoute && decodedSession?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/courses/:id/learn/:path*"],
};
