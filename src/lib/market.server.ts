import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export function createPublicDatabaseClient() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) throw new Error("The database connection is unavailable.");

  return createClient<Database>(url, publishableKey, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}