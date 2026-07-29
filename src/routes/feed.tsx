import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/lib/auth-guard";
import { getFeed, createPost, toggleLike, getLikedPostIds } from "@/lib/social.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PostCard } from "@/components/post-card";
import { ImageUpload } from "@/components/image-upload";
import { Send } from "lucide-react";

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

