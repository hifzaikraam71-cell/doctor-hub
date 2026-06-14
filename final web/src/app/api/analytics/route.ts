import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServiceClient();

    const [
      { count: totalUsers },
      { count: totalDoctors },
      { count: totalPatients },
      { count: totalAppointments },
      { count: pendingPayments },
      { count: confirmedAppointments },
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("doctors").select("*", { count: "exact", head: true }),
      supabase.from("patients").select("*", { count: "exact", head: true }),
      supabase.from("appointments").select("*", { count: "exact", head: true }),
      supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    ]);

    const { data: recentAppointments } = await supabase
      .from("appointments")
      .select(`
        id, appointment_date, status,
        patients (users (full_name)),
        doctors (users (full_name))
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalDoctors: totalDoctors || 0,
        totalPatients: totalPatients || 0,
        totalAppointments: totalAppointments || 0,
        pendingPayments: pendingPayments || 0,
        confirmedAppointments: confirmedAppointments || 0,
      },
      recentAppointments,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
