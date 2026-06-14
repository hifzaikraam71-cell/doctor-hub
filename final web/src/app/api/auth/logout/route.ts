import { clearAuthCookieResponse } from "@/lib/auth-server";

export async function POST() {
  return clearAuthCookieResponse({ message: "Logged out successfully" });
}
