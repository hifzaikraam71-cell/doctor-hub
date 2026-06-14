import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/config";
import { getLocalDoctors } from "@/lib/db/local-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const disease = searchParams.get("disease") || undefined;
    const treatment = searchParams.get("treatment_type") || undefined;
    const specialization = searchParams.get("specialization") || undefined;
    const city = searchParams.get("city");

    if (!isSupabaseConfigured()) {
      const doctors = await getLocalDoctors({
        disease,
        treatment_type: treatment,
        specialization,
      });
      return NextResponse.json({ doctors, count: doctors.length });
    }

    const supabase = createServiceClient();

    let query = supabase
      .from("doctors")
      .select(`
        *,
        users (id, full_name, email, phone, avatar_url),
        clinics (id, name, address, city, phone)
      `)
      .eq("is_verified", true);

    if (treatment) {
      query = query.eq("treatment_type", treatment);
    }
    if (specialization) {
      query = query.ilike("specialization", `%${specialization}%`);
    }
    if (disease) {
      query = query.contains("diseases", [disease]);
    }

    const { data: doctors, error } = await query.order("rating", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = doctors || [];
    if (city) {
      filtered = filtered.filter((d) =>
        d.clinics?.some((c: { city: string }) =>
          c.city.toLowerCase().includes(city.toLowerCase())
        )
      );
    }

    return NextResponse.json({ doctors: filtered, count: filtered.length });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
