import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/lib/auth-guard";
import { getConversations } from "@/lib/social.functions";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — سيگار صورتی" },
      { name: "description", content: "Your conversations on سيگار صورتی." },
      { property: "og:title", content: "Messages — سيگار صورتی" },
      { property: "og:description", content: "Your conversations on سيگار صورتی." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/messages" }],
  }),
  beforeLoad: requireAuth,
  component: MessagesPage,
});

function MessagesPage() {
  const { user } = useAuth();
  const fetchConversations = useServerFn(getConversations);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => fetchConversations(),
  });

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24 pt-6 md:pb-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">Messages</h1>

      <div className="card-soft mt-6 divide-y divide-border overflow-hidden rounded-2xl">
        {conversations.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <p>No conversations yet.</p>
            <p className="mt-1 text-sm">
              Start one from someone's <Link to="/explore" className="text-primary hover:underline">profile</Link>.
            </p>
          </div>
        )}
        {conversations.map((conversation) => {
          const isA = conversation.participant_a === user?.id;
          const other = isA ? conversation.participant_b_profile : conversation.participant_a_profile;
          return (
            <Link
              key={conversation.id}
              to="/messages/$id"
              params={{ id: conversation.id }}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-accent"
            >
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={other.avatar_url ?? undefined} />
                <AvatarFallback className="bg-lavender-100 text-lavender-600">
                  {(other.display_name ?? other.username ?? "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-foreground">{other.display_name ?? other.username}</p>
                <p className="text-xs text-muted-foreground">@{other.username}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
