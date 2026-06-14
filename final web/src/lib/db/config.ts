import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();

  if (!url || !key) return false;

  const placeholders = [
    "your-project",
    "your-anon-key",
    "your-service-role-key",
    "xxxxx",
  ];
  return !placeholders.some((p) => url.includes(p) || key.includes(p));
}
