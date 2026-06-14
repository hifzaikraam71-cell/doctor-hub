import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, role, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ users: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { user_id, is_active, is_verified } = await request.json();
    const supabase = createServiceClient();

    if (is_active !== undefined) {
      await supabase.from("users").update({ is_active }).eq("id", user_id);
    }

    if (is_verified !== undefined) {
      const { data: doctor } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", user_id)
        .single();
      if (doctor) {
        await supabase.from("doctors").update({ is_verified }).eq("id", doctor.id);
      }
    }

    return NextResponse.json({ message: "User updated" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
