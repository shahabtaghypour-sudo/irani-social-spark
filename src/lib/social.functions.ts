import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

// Public read-only fetchers (no auth required)
export const getPublicProfile = createServerFn({ method: "GET" })
  .validator((data) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      },
    );

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", data.userId)
      .single();

    if (error) throw error;
    return profile;
  });

export const getPublicPosts = createServerFn({ method: "GET" })
  .validator((data) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      },
    );

    const { data: posts, error } = await supabase
      .from("posts")
      .select("*, profiles!inner(user_id, username, display_name, avatar_url)")
      .eq("profiles.user_id", data.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return posts ?? [];
  });

export const getPublicFeed = createServerFn({ method: "GET" })
  .validator((data) => z.object({ limit: z.number().min(1).max(50).default(20) }).parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      },
    );

    const { data: posts, error } = await supabase
      .from("posts")
      .select("*, profiles!inner(username, display_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (error) throw error;
    return posts ?? [];
  });

// Authenticated fetchers
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("user_id", context.userId)
      .single();

    if (error) throw error;
    return profile;
  });

export const ensureMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: existing } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .single();

    if (existing) return existing;

    const { data: profile, error } = await context.supabase
      .from("profiles")
      .insert({
        user_id: context.userId,
        username: "user_" + context.userId.slice(0, 8),
        display_name: "New User",
      })
      .select()
      .single();

    if (error) throw error;
    return profile;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        username: z.string().min(2).max(30).optional(),
        display_name: z.string().min(1).max(50).optional(),
        bio: z.string().max(160).optional(),
        avatar_url: z.string().url().max(500).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .select()
      .single();

    if (error) throw error;
    return profile;
  });

export const getFeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: myProfile } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .single();

    const { data: following, error: followingError } = await context.supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", myProfile?.id ?? "00000000-0000-0000-0000-000000000000");

    if (followingError) throw followingError;

    const authorIds = [...(following?.map((f) => f.following_id) ?? [])];
    if (myProfile?.id) authorIds.push(myProfile.id);

    const { data: posts, error } = await context.supabase
      .from("posts")
      .select("*, profiles!inner(id, user_id, username, display_name, avatar_url)")
      .in("author_id", authorIds.length > 0 ? authorIds : ["00000000-0000-0000-0000-000000000000"])
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return posts ?? [];
  });


export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        content: z.string().min(1).max(1000),
        imageUrl: z.string().url().max(500).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .single();

    if (!profile) throw new Error("Profile not found");

    const { data: post, error } = await context.supabase
      .from("posts")
      .insert({
        author_id: profile.id,
        content: data.content,
        image_url: data.imageUrl,
      })
      .select("*, profiles!inner(username, display_name, avatar_url)")
      .single();

    if (error) throw error;
    return post;
  });

export const toggleLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ postId: z.string().uuid(), liked: z.boolean() }).parse(data))
  .handler(async ({ context, data }) => {
    if (data.liked) {
      const { error } = await context.supabase.from("likes").insert({
        post_id: data.postId,
        user_id: context.userId,
      });
      if (error && error.code !== "23505") throw error;
    } else {
      const { error } = await context.supabase
        .from("likes")
        .delete()
        .eq("post_id", data.postId)
        .eq("user_id", context.userId);
      if (error) throw error;
    }

    const { count, error: countError } = await context.supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", data.postId);

    if (countError) throw countError;

    const { error: updateError } = await context.supabase
      .from("posts")
      .update({ like_count: count ?? 0 })
      .eq("id", data.postId);

    if (updateError) throw updateError;

    return { liked: data.liked, count: count ?? 0 };
  });

export const getLikedPostIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ postIds: z.array(z.string().uuid()) }).parse(data))
  .handler(async ({ context, data }) => {
    const { data: likes, error } = await context.supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", context.userId)
      .in("post_id", data.postIds);

    if (error) throw error;
    return new Set(likes?.map((l) => l.post_id) ?? []);
  });

export const getComments = createServerFn({ method: "GET" })
  .validator((data) => z.object({ postId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      },
    );

    const { data: comments, error } = await supabase
      .from("comments")
      .select("*, profiles!inner(username, display_name, avatar_url)")
      .eq("post_id", data.postId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return comments ?? [];
  });

export const createComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z.object({ postId: z.string().uuid(), content: z.string().min(1).max(500) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .single();

    if (!profile) throw new Error("Profile not found");

    const { data: comment, error } = await context.supabase
      .from("comments")
      .insert({
        post_id: data.postId,
        author_id: profile.id,
        content: data.content,
      })
      .select("*, profiles!inner(username, display_name, avatar_url)")
      .single();

    if (error) throw error;

    const { count, error: countError } = await context.supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", data.postId);

    if (countError) throw countError;

    await context.supabase.from("posts").update({ comment_count: count ?? 0 }).eq("id", data.postId);

    return comment;
  });

export const toggleFollow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ profileId: z.string().uuid(), follow: z.boolean() }).parse(data))
  .handler(async ({ context, data }) => {
    const { data: myProfile } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .single();

    if (!myProfile) throw new Error("Profile not found");

    if (data.follow) {
      const { error } = await context.supabase.from("follows").insert({
        follower_id: myProfile.id,
        following_id: data.profileId,
      });
      if (error && error.code !== "23505") throw error;
    } else {
      const { error } = await context.supabase
        .from("follows")
        .delete()
        .eq("follower_id", myProfile.id)
        .eq("following_id", data.profileId);
      if (error) throw error;
    }

    return { following: data.follow };
  });

export const isFollowing = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ profileId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { data: myProfile } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .single();

    if (!myProfile) return false;

    const { data: follow, error } = await context.supabase
      .from("follows")
      .select("id")
      .eq("follower_id", myProfile.id)
      .eq("following_id", data.profileId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!follow;
  });

export const getSuggestedProfiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: myProfile } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .single();

    const excludeId = myProfile?.id ?? "00000000-0000-0000-0000-000000000000";

    const { data: profiles, error } = await context.supabase
      .from("profiles")
      .select("id, user_id, username, display_name, avatar_url, bio")
      .neq("id", excludeId)
      .limit(20);

    if (error) throw error;
    return profiles ?? [];
  });

export const getConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: myProfile } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .single();

    if (!myProfile) throw new Error("Profile not found");

    const { data: conversations, error } = await context.supabase
      .from("conversations")
      .select("*, participant_a_profile:profiles!participant_a(username, display_name, avatar_url), participant_b_profile:profiles!participant_b(username, display_name, avatar_url)")
      .or(`participant_a.eq.${myProfile.id},participant_b.eq.${myProfile.id}`)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return conversations ?? [];
  });

export const getMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ conversationId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { data: messages, error } = await context.supabase
      .from("messages")
      .select("*, sender_profile:profiles!sender_id(username, display_name, avatar_url)")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return messages ?? [];
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z.object({ conversationId: z.string().uuid(), content: z.string().min(1).max(2000) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { data: myProfile } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .single();

    if (!myProfile) throw new Error("Profile not found");

    const { data: message, error } = await context.supabase
      .from("messages")
      .insert({
        conversation_id: data.conversationId,
        sender_id: myProfile.id,
        content: data.content,
      })
      .select("*, sender_profile:profiles!sender_id(username, display_name, avatar_url)")
      .single();

    if (error) throw error;

    await context.supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", data.conversationId);

    return message;
  });

export const getOrCreateConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ otherProfileId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { data: myProfile } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .single();

    if (!myProfile) throw new Error("Profile not found");

    const a = myProfile.id;
    const b = data.otherProfileId;
    const [first, second] = a < b ? [a, b] : [b, a];

    const { data: existing, error: existingError } = await context.supabase
      .from("conversations")
      .select("id")
      .eq("participant_a", first)
      .eq("participant_b", second)
      .single();

    if (existingError && existingError.code !== "PGRST116") throw existingError;
    if (existing) return existing.id;

    const { data: conversation, error } = await context.supabase
      .from("conversations")
      .insert({ participant_a: first, participant_b: second })
      .select("id")
      .single();

    if (error) throw error;
    return conversation.id;
  });
