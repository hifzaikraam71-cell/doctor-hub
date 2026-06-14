import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@/types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "doctor-hub-default-secret-change-in-production"
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  patient: 1,
  doctor: 2,
  assistant: 3,
  admin: 4,
  super_admin: 5,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  patient: "/dashboard/patient",
  doctor: "/dashboard/doctor",
  assistant: "/dashboard/assistant",
  admin: "/dashboard/admin",
  super_admin: "/dashboard/admin",
};
