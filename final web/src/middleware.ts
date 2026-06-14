import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import type { UserRole } from "@/types";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/doctors"];
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  const isPublicRoute =
    publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/api/auth");
  const isAuthRoute = authRoutes.some((r) => pathname === r);
  const isApiRoute = pathname.startsWith("/api/");

  const publicApiRoutes = ["/api/doctors", "/api/schedules"];
  const isPublicApi =
    publicApiRoutes.some((r) => pathname === r || pathname.startsWith(r)) &&
    request.method === "GET";

  if (isApiRoute && !pathname.startsWith("/api/auth") && !isPublicApi) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-user-email", payload.email);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (token && isAuthRoute) {
    const payload = await verifyToken(token);
    if (payload) {
      const roleRoutes: Record<UserRole, string> = {
        patient: "/dashboard/patient",
        doctor: "/dashboard/doctor",
        assistant: "/dashboard/assistant",
        admin: "/dashboard/admin",
        super_admin: "/dashboard/admin",
      };
      return NextResponse.redirect(new URL(roleRoutes[payload.role], request.url));
    }
  }

  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/dashboard") && token) {
    const payload = await verifyToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth-token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
