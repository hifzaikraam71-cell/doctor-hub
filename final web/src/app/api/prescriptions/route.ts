import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const prescriptionSchema = z.object({
  patient_id: z.string().uuid(),
  medicines: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string(),
    })
  ),
  instructions: z.string().optional(),
  follow_up_date: z.string().optional(),
  appointment_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patient_id");
    const supabase = createServiceClient();

    let query = supabase
      .from("prescriptions")
      .select(`
        *,
        doctors (specialization, users (full_name)),
        patients (users (full_name))
      `)
      .order("created_at", { ascending: false });

    if (role === "patient") {
      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", userId)
        .single();
      if (patient) query = query.eq("patient_id", patient.id);
    } else if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ prescriptions: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (role !== "doctor") {
      return NextResponse.json({ error: "Only doctors can add prescriptions" }, { status: 403 });
    }

    const body = await request.json();
    const data = prescriptionSchema.parse(body);
    const supabase = createServiceClient();

    const { data: doctor } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    const { data: prescription, error } = await supabase
      .from("prescriptions")
      .insert({
        patient_id: data.patient_id,
        doctor_id: doctor.id,
        medicines: data.medicines,
        instructions: data.instructions,
        follow_up_date: data.follow_up_date,
        appointment_id: data.appointment_id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ prescription, message: "Prescription added" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
