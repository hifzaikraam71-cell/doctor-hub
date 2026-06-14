import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const messageSchema = z.object({
  receiver_id: z.string().uuid(),
  content: z.string().min(1),
  appointment_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("user_id");
    const supabase = createServiceClient();

    let query = supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: true });

    if (otherUserId) {
      query = query.or(
        `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
      );
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ messages: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const body = await request.json();
    const data = messageSchema.parse(body);
    const supabase = createServiceClient();

    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        sender_id: userId,
        receiver_id: data.receiver_id,
        content: data.content,
        appointment_id: data.appointment_id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
