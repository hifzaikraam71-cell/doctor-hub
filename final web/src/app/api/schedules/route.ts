import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const scheduleSchema = z.object({
  clinic_id: z.string().uuid().optional(),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  slot_duration: z.number().default(30),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctor_id");
    const supabase = createServiceClient();

    let query = supabase.from("schedules").select("*, clinics(name, city)").eq("is_active", true);

    if (doctorId) query = query.eq("doctor_id", doctorId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ schedules: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (role !== "doctor") {
      return NextResponse.json({ error: "Only doctors can manage schedules" }, { status: 403 });
    }

    const body = await request.json();
    const data = scheduleSchema.parse(body);
    const supabase = createServiceClient();

    const { data: doctor } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    const { data: schedule, error } = await supabase
      .from("schedules")
      .insert({ ...data, doctor_id: doctor.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ schedule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
