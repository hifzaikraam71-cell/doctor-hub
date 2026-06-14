import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import crypto from "crypto";

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotSchema.parse(body);
    const supabase = createServiceClient();

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (!user) {
      return NextResponse.json({
        message: "If an account exists, a reset link has been sent",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires_at = new Date(Date.now() + 3600000).toISOString();

    await supabase.from("password_resets").insert({
      user_id: user.id,
      token,
      expires_at,
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    return NextResponse.json({
      message: "If an account exists, a reset link has been sent",
      resetUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
