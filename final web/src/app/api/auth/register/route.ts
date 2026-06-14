import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createServiceClient } from "@/lib/supabase/server";
import { signToken } from "@/lib/auth";
import { jsonWithAuthCookie } from "@/lib/auth-server";
import { isSupabaseConfigured } from "@/lib/db/config";
import { createLocalUser, findUserByEmail } from "@/lib/db/local-store";
import type { UserRole } from "@/types";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(["patient", "doctor", "assistant", "admin", "super_admin"]).default("patient"),
  specialization: z.string().optional(),
  treatment_type: z.enum(["allopathic", "homeopathic", "herbal"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);
    const password_hash = await bcrypt.hash(data.password, 12);

    if (!isSupabaseConfigured()) {
      const user = await createLocalUser({
        email: data.email,
        password_hash,
        full_name: data.full_name,
        phone: data.phone,
        role: data.role,
        specialization: data.specialization,
        treatment_type: data.treatment_type,
      });

      const token = await signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
      });

      return jsonWithAuthCookie(
        {
          message: "Registration successful",
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

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", data.email)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email: data.email,
        password_hash,
        full_name: data.full_name,
        phone: data.phone,
        role: data.role,
      })
      .select()
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || "Registration failed" }, { status: 500 });
    }

    if (data.role === "patient") {
      await supabase.from("patients").insert({ user_id: user.id });
    } else if (data.role === "doctor") {
      await supabase.from("doctors").insert({
        user_id: user.id,
        specialization: data.specialization || "General Physician",
        treatment_type: data.treatment_type || "allopathic",
        diseases: [],
      });
    } else if (data.role === "assistant") {
      await supabase.from("assistants").insert({ user_id: user.id });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.full_name,
    });

    return jsonWithAuthCookie(
      {
        message: "Registration successful",
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
    if (error instanceof Error && error.message === "Email already registered") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
