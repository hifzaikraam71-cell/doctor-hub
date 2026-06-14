import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken, type JWTPayload } from "@/lib/auth";

export type { JWTPayload };

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function jsonWithAuthCookie<T extends Record<string, unknown>>(
  data: T,
  token: string,
  status = 200
) {
  const response = NextResponse.json(data, { status });
  response.cookies.set("auth-token", token, COOKIE_OPTIONS);
  return response;
}

export function clearAuthCookieResponse(data: Record<string, unknown> = { message: "Logged out" }) {
  const response = NextResponse.json(data);
  response.cookies.delete("auth-token");
  return response;
}
