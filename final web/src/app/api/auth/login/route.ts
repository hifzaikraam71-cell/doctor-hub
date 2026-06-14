import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createServiceClient } from "@/lib/supabase/server";
import { signToken } from "@/lib/auth";
import { jsonWithAuthCookie } from "@/lib/auth-server";
import { isSupabaseConfigured } from "@/lib/db/config";
import { findUserByEmail } from "@/lib/db/local-store";
import type { UserRole } from "@/types";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    if (!isSupabaseConfigured()) {
      const user = await findUserByEmail(email);

      if (!user) {
        return NextResponse.json(
          { error: "Invalid email or password. Please register first." },
          { status: 401 }
        );
      }

      if (!user.is_active) {
        return NextResponse.json({ error: "Account is deactivated" }, { status: 403 });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      const token = await signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
      });

      return jsonWithAuthCookie(
        {
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
          },
        },
        token
      );
    }

    const supabase = createServiceClient();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.full_name,
    });

    return jsonWithAuthCookie(
      {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      },
      token
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
