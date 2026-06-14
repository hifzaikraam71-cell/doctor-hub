import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const appointmentSchema = z.object({
  doctor_id: z.string().uuid(),
  clinic_id: z.string().uuid().optional(),
  appointment_date: z.string(),
  appointment_time: z.string(),
  symptoms: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    const supabase = createServiceClient();

    let query = supabase
      .from("appointments")
      .select(`
        *,
        doctors (id, specialization, treatment_type, consultation_fee, users (full_name, phone)),
        patients (id, users (full_name, email, phone)),
        clinics (name, address, city),
        payments (*)
      `)
      .order("appointment_date", { ascending: false });

    if (role === "patient") {
      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", userId)
        .single();
      if (patient) query = query.eq("patient_id", patient.id);
    } else if (role === "doctor") {
      const { data: doctor } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", userId)
        .single();
      if (doctor) query = query.eq("doctor_id", doctor.id);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ appointments: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const body = await request.json();
    const data = appointmentSchema.parse(body);
    const supabase = createServiceClient();

    const { data: patient } = await supabase
      .from("patients")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!patient) {
      return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
    }

    const { data: doctor } = await supabase
      .from("doctors")
      .select("consultation_fee")
      .eq("id", data.doctor_id)
      .single();

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: patient.id,
        doctor_id: data.doctor_id,
        clinic_id: data.clinic_id,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        symptoms: data.symptoms,
        status: "pending",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("payments").insert({
      appointment_id: appointment.id,
      amount: doctor?.consultation_fee || 0,
      status: "pending",
    });

    return NextResponse.json({ appointment, message: "Appointment booked. Please upload payment." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
