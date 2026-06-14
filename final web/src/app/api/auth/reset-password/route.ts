import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createServiceClient } from "@/lib/supabase/server";

const resetSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetSchema.parse(body);
    const supabase = createServiceClient();

    const { data: reset } = await supabase
      .from("password_resets")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (!reset || new Date(reset.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 12);

    await supabase.from("users").update({ password_hash }).eq("id", reset.user_id);
    await supabase.from("password_resets").update({ used: true }).eq("id", reset.id);

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
