import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const clinicSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  phone: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    const supabase = createServiceClient();

    let query = supabase.from("clinics").select("*");

    if (role === "doctor") {
      const { data: doctor } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", userId)
        .single();
      if (doctor) query = query.eq("doctor_id", doctor.id);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ clinics: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (role !== "doctor") {
      return NextResponse.json({ error: "Only doctors can add clinics" }, { status: 403 });
    }

    const body = await request.json();
    const data = clinicSchema.parse(body);
    const supabase = createServiceClient();

    const { data: doctor } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    const { data: clinic, error } = await supabase
      .from("clinics")
      .insert({ ...data, doctor_id: doctor.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ clinic });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
