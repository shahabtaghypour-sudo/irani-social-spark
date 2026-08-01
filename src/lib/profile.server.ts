import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export async function ensureProfile(supabase: SupabaseClient<Database>, userId: string) {
  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      username: `member_${userId.replaceAll("-", "").slice(0, 12)}`,
      display_name: "New member",
    })
    .select("id")
    .single();

  if (createError) throw createError;
  return created;
}