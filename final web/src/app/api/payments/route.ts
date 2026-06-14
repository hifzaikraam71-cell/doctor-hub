import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const paymentSchema = z.object({
  appointment_id: z.string().uuid(),
  screenshot_url: z.string().url(),
});

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    const supabase = createServiceClient();

    let query = supabase
      .from("payments")
      .select(`
        *,
        appointments (
          id, appointment_date, appointment_time, status, symptoms,
          patients (users (full_name, email)),
          doctors (specialization, users (full_name))
        )
      `)
      .order("created_at", { ascending: false });

    if (role === "assistant") {
      query = query.eq("status", "pending");
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ payments: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointment_id, screenshot_url } = paymentSchema.parse(body);
    const supabase = createServiceClient();

    const { data: payment, error } = await supabase
      .from("payments")
      .update({ screenshot_url, status: "pending" })
      .eq("appointment_id", appointment_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase
      .from("appointments")
      .update({ status: "payment_uploaded" })
      .eq("id", appointment_id);

    return NextResponse.json({ payment, message: "Payment screenshot uploaded" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
