import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const verifySchema = z.object({
  payment_id: z.string().uuid(),
  action: z.enum(["verify", "reject"]),
  rejection_reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (role !== "assistant" && role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { payment_id, action, rejection_reason } = verifySchema.parse(body);
    const supabase = createServiceClient();

    const { data: payment } = await supabase
      .from("payments")
      .select("appointment_id")
      .eq("id", payment_id)
      .single();

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (action === "verify") {
      await supabase
        .from("payments")
        .update({
          status: "verified",
          verified_by: userId,
          verified_at: new Date().toISOString(),
        })
        .eq("id", payment_id);

      await supabase
        .from("appointments")
        .update({ status: "confirmed" })
        .eq("id", payment.appointment_id);
    } else {
      await supabase
        .from("payments")
        .update({ status: "rejected", rejection_reason })
        .eq("id", payment_id);

      await supabase
        .from("appointments")
        .update({ status: "pending" })
        .eq("id", payment.appointment_id);
    }

    return NextResponse.json({ message: `Payment ${action === "verify" ? "verified" : "rejected"}` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
