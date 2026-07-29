import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/lib/auth-guard";
import { getFeed, createPost, toggleLike, getLikedPostIds } from "@/lib/social.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send, ImageIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Feed — سيگار صورتی" },
      { name: "description", content: "Your personal feed on سيگار صورتی." },
      { property: "og:title", content: "Feed — سيگار صورتی" },
      { property: "og:description", content: "Your personal feed on سيگار صورتی." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/feed" }],
  }),
  beforeLoad: requireAuth,
  component: FeedPage,
});

function FeedPage() {
  const queryClient = useQueryClient();
  const fetchFeed = useServerFn(getFeed);
  const fetchLikedIds = useServerFn(getLikedPostIds);
  const createPostFn = useServerFn(createPost);
  const toggleLikeFn = useServerFn(toggleLike);

  const { data: posts = [] } = useQuery({
    queryKey: ["feed"],
    queryFn: () => fetchFeed(),
  });

  const postIds = posts.map((p) => p.id);
  const { data: likedSet } = useQuery({
    queryKey: ["liked", postIds],
    queryFn: () => fetchLikedIds({ data: { postIds } }),
    enabled: postIds.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: createPostFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      setContent("");
      setImageUrl("");
    },
  });

  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate({ data: { content: content.trim(), imageUrl: imageUrl || null } });
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24 pt-6 md:pb-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">Your feed</h1>

      <form onSubmit={handleSubmit} className="card-soft mt-6 rounded-2xl p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="min-h-[100px] resize-none rounded-xl border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
        <div className="mt-3 flex items-center gap-2">
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
            className="flex-1 rounded-xl"
          />
          <Button type="submit" disabled={createMutation.isPending || !content.trim()} className="rounded-xl">
            {createMutation.isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      <div className="mt-8 space-y-6">
        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Your feed is quiet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Follow people from <Link to="/explore" className="text-primary hover:underline">Explore</Link> to see their posts.
            </p>
          </div>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            liked={likedSet?.has(post.id) ?? false}
            onToggleLike={(liked) => toggleLikeFn({ data: { postId: post.id, liked } })}
          />
        ))}
      </div>
    </div>
  );
}

function PostCard({
  post,
  liked,
  onToggleLike,
}: {
  post: Awaited<ReturnType<typeof getFeed>>[number];
  liked: boolean;
  onToggleLike: (liked: boolean) => void;
}) {
  const author = post.profiles;
  return (
    <article className="card-soft overflow-hidden rounded-2xl">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.avatar_url ?? undefined} />
            <AvatarFallback className="bg-lavender-100 text-lavender-600 text-sm">
              {(author.display_name ?? author.username ?? "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link
              to="/profile/$id"
              params={{ id: author.user_id }}
              className="truncate font-display font-semibold text-foreground hover:underline"
            >
              {author.display_name ?? author.username}
            </Link>
            <p className="text-xs text-muted-foreground">@{author.username}</p>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>

        <p className="mt-3 whitespace-pre-wrap text-foreground">{post.content}</p>
        {post.image_url && (
          <div className="mt-3 overflow-hidden rounded-xl">
            <img src={post.image_url} alt="Post media" className="max-h-[400px] w-full object-cover" />
          </div>
        )}

        <div className="mt-4 flex items-center gap-6">
          <button
            onClick={() => onToggleLike(!liked)}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              liked ? "text-rose-500" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            {post.like_count}
          </button>
          <Link
            to="/post/$id"
            params={{ id: post.id }}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            {post.comment_count}
          </Link>
        </div>
      </div>
    </article>
  );
}
