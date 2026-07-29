import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export const LISTING_CATEGORIES = ["wine", "handmade", "art", "vintage", "other"] as const;

const categorySchema = z.enum(LISTING_CATEGORIES);

async function publicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const getListings = createServerFn({ method: "GET" })
  .validator((data) =>
    z
      .object({ category: categorySchema.optional().nullable() })
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    const supabase = await publicClient();

    let query = supabase
      .from("listings")
      .select("*, profiles!inner(id, user_id, username, display_name, avatar_url)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(60);

    if (data.category) query = query.eq("category", data.category);

    const { data: listings, error } = await query;
    if (error) throw error;
    return listings ?? [];
  });

export const getMyListings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: myProfile } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .single();

    if (!myProfile) return [];

    const { data: listings, error } = await context.supabase
      .from("listings")
      .select("*, profiles!inner(id, user_id, username, display_name, avatar_url)")
      .eq("seller_id", myProfile.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return listings ?? [];
  });

export const createListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        title: z.string().min(2).max(120),
        description: z.string().max(1000).optional().nullable(),
        price: z.number().min(0).max(10_000_000),
        currency: z.string().min(1).max(8).default("USD"),
        category: categorySchema,
        imageUrl: z.string().url().max(2000).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { data: myProfile } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .single();

    if (!myProfile) throw new Error("Profile not found");

    const { data: listing, error } = await context.supabase
      .from("listings")
      .insert({
        seller_id: myProfile.id,
        title: data.title,
        description: data.description ?? null,
        price: data.price,
        currency: data.currency,
        category: data.category,
        image_url: data.imageUrl ?? null,
      })
      .select("*, profiles!inner(id, user_id, username, display_name, avatar_url)")
      .single();

    if (error) throw error;
    return listing;
  });

export const setListingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z.object({ listingId: z.string().uuid(), status: z.enum(["active", "sold"]) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("listings")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.listingId);

    if (error) throw error;
    return { status: data.status };
  });

export const deleteListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ listingId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("listings").delete().eq("id", data.listingId);
    if (error) throw error;
    return { deleted: true };
  });
