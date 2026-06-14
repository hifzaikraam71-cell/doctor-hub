export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !key) return false;

  const placeholders = ["your-project", "your-anon-key", "your-service-role-key", "xxxxx"];
  return !placeholders.some((p) => url.includes(p) || key.includes(p));
}
