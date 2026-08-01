import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { LISTING_CATEGORIES } from "@/lib/market.constants";
import { createPublicDatabaseClient } from "@/lib/market.server";
import { ensureProfile } from "@/lib/profile.server";

export { LISTING_CATEGORIES } from "@/lib/market.constants";

export const getListings = createServerFn({ method: "GET" })
  .validator((data) =>
    z
      .object({ category: z.enum(LISTING_CATEGORIES).optional().nullable() })
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    const supabase = createPublicDatabaseClient();

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
        category: z.enum(LISTING_CATEGORIES),
        imageUrl: z.string().url().max(2000).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const myProfile = await ensureProfile(context.supabase, context.userId);

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
