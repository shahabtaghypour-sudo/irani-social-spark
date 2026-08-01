import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getPublicProfile,
  getPublicPosts,
  toggleFollow,
  isFollowing,
  getOrCreateConversation,
  updateMyProfile,
} from "@/lib/social.functions";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/image-upload";
import { PostCard } from "@/components/post-card";
import { MessageSquare, Pencil } from "lucide-react";

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

  const { data: profile, isPending: profilePending, isError: profileError } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => fetchProfile({ data: { userId: id } }),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["public-posts", id],
    queryFn: () => fetchPosts({ data: { userId: id } }),
  });

  const { data: following } = useQuery({
    queryKey: ["following", profile?.id],
      queryFn: () => {
        if (!profile) return Promise.resolve(false);
        return isFollowingFn({ data: { profileId: profile.id } });
      },
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

  const saveProfileFn = useServerFn(updateMyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setUsername(profile.username ?? "");
    setBio(profile.bio ?? "");
    setAvatarUrl(profile.avatar_url ?? null);
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: saveProfileFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", id] });
      setIsEditing(false);
    },
  });

  if (profilePending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <p>Loading profile…</p>
      </div>
    );
  }

  if (profileError || !profile) {
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

            {isOwnProfile ? (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-6"
                  onClick={() => setIsEditing((v) => !v)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {isEditing ? "Cancel" : "Edit profile"}
                </Button>
              </div>
            ) : (
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

        {isOwnProfile && isEditing && (
          <form
            className="mt-6 space-y-3 border-t border-border pt-6"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate({
                data: {
                  display_name: displayName.trim() || undefined,
                  username: username.trim() || undefined,
                  bio: bio.trim(),
                  avatar_url: avatarUrl,
                },
              });
            }}
          >
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              className="rounded-xl"
            />
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="rounded-xl"
            />
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              placeholder="Write a short bio…"
              className="min-h-[80px] resize-none rounded-xl"
            />
            <ImageUpload value={avatarUrl} onChange={setAvatarUrl} label="Upload an avatar" />
            {saveMutation.isError && (
              <p className="text-sm text-destructive">
                Couldn't save — try a different username.
              </p>
            )}
            <Button type="submit" disabled={saveMutation.isPending} className="w-full rounded-xl">
              {saveMutation.isPending ? "Saving…" : "Save profile"}
            </Button>
          </form>
        )}
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
