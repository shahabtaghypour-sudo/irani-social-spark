import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/lib/auth-guard";
import { getSuggestedProfiles, toggleFollow, isFollowing } from "@/lib/social.functions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — سيگار صورتی" },
      { name: "description", content: "Discover people to follow on سيگار صورتی." },
      { property: "og:title", content: "Explore — سيگار صورتی" },
      { property: "og:description", content: "Discover people to follow on سيگار صورتی." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/explore" }],
  }),
  beforeLoad: requireAuth,
  component: ExplorePage,
});

function ExplorePage() {
  const queryClient = useQueryClient();
  const fetchSuggested = useServerFn(getSuggestedProfiles);
  const followFn = useServerFn(toggleFollow);
  const isFollowingFn = useServerFn(isFollowing);
  const [search, setSearch] = useState("");

  const { data: profiles = [] } = useQuery({
    queryKey: ["suggested-profiles"],
    queryFn: () => fetchSuggested(),
  });

  const profileIds = profiles.map((p) => p.id);
  const { data: followingMap } = useQuery({
    queryKey: ["following", profileIds],
    queryFn: async () => {
      const map: Record<string, boolean> = {};
      await Promise.all(
        profileIds.map(async (id) => {
          map[id] = await isFollowingFn({ profileId: id });
        }),
      );
      return map;
    },
    enabled: profileIds.length > 0,
  });

  const followMutation = useMutation({
    mutationFn: followFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const filtered = profiles.filter(
    (p) =>
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      (p.display_name && p.display_name.toLowerCase().includes(search.toLowerCase())) ||
      (p.bio && p.bio.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6 md:pb-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">Explore</h1>
      <p className="mt-1 text-muted-foreground">Discover new voices and build your circle.</p>

      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, username, or bio"
          className="rounded-xl pl-10"
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {filtered.map((profile) => (
          <div key={profile.id} className="card-soft rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="bg-lavender-100 text-lavender-600">
                  {(profile.display_name ?? profile.username ?? "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Link
                  to="/profile/$id"
                  params={{ id: profile.user_id }}
                  className="truncate font-display font-semibold text-foreground hover:underline"
                >
                  {profile.display_name ?? profile.username}
                </Link>
                <p className="text-xs text-muted-foreground">@{profile.username}</p>
                {profile.bio && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{profile.bio}</p>}
              </div>
            </div>
            <Button
              variant={followingMap?.[profile.id] ? "outline" : "default"}
              size="sm"
              className="mt-4 w-full rounded-xl"
              disabled={followMutation.isPending}
              onClick={() => followMutation.mutate({ profileId: profile.id, follow: !followingMap?.[profile.id] })}
            >
              {followingMap?.[profile.id] ? "Following" : "Follow"}
            </Button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center text-muted-foreground">
          <p>No profiles match your search.</p>
        </div>
      )}
    </div>
  );
}
