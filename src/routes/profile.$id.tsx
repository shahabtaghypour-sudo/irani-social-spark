import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicProfile, getPublicPosts, toggleFollow, isFollowing, getOrCreateConversation } from "@/lib/social.functions";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCard } from "@/components/post-card";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/profile/$id")({
  head: ({ params }) => ({
    meta: [
      { title: "Profile — Pink Cigarette" },
      { name: "description", content: "User profile on Pink Cigarette." },
      { property: "og:title", content: "Profile — Pink Cigarette" },
      { property: "og:description", content: "User profile on Pink Cigarette." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `/profile/${params.id}` }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { id } = useParams({ from: "/profile/$id" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchProfile = useServerFn(getPublicProfile);
  const fetchPosts = useServerFn(getPublicPosts);
  const followFn = useServerFn(toggleFollow);
  const isFollowingFn = useServerFn(isFollowing);
  const getConversationFn = useServerFn(getOrCreateConversation);

  const { data: profile } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => fetchProfile({ data: { userId: id } }),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["public-posts", id],
    queryFn: () => fetchPosts({ data: { userId: id } }),
  });

  const { data: following } = useQuery({
    queryKey: ["following", profile?.id],
    queryFn: () => isFollowingFn({ data: { profileId: profile!.id } }),
    enabled: !!profile,
  });

  const followMutation = useMutation({
    mutationFn: followFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following", profile?.id] });
    },
  });

  const messageMutation = useMutation({
    mutationFn: getConversationFn,
    onSuccess: (conversationId) => {
      navigate({ to: "/messages/$id", params: { id: conversationId } });
    },
  });

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <p>Profile not found.</p>
      </div>
    );
  }

  const isOwnProfile = user?.id === id;

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24 pt-6 md:pb-6">
      <div className="card-soft rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 shrink-0">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="bg-lavender-100 text-lavender-600 text-lg">
              {(profile.display_name ?? profile.username ?? "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-semibold text-foreground">
              {profile.display_name ?? profile.username}
            </h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {profile.bio && <p className="mt-3 text-sm text-foreground">{profile.bio}</p>}

            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="text-muted-foreground">
                <strong className="text-foreground">{profile.follower_count}</strong> followers
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{profile.following_count}</strong> following
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{posts.length}</strong> posts
              </span>
            </div>

            {!isOwnProfile && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant={following ? "outline" : "default"}
                  size="sm"
                  className="rounded-full px-6"
                  disabled={followMutation.isPending}
                  onClick={() => followMutation.mutate({ data: { profileId: profile.id, follow: !following } })}
                >
                  {following ? "Following" : "Follow"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-6"
                  disabled={messageMutation.isPending}
                  onClick={() => messageMutation.mutate({ data: { otherProfileId: profile.id } })}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} showAuthor={false} />
        ))}
        {posts.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p>No posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
