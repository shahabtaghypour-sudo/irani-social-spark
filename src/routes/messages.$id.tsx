import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/lib/auth-guard";
import { getMessages, sendMessage, getConversations } from "@/lib/social.functions";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";

export const Route = createFileRoute("/messages/$id")({
  head: () => ({
    meta: [
      { title: "Conversation — Pink Cigarette" },
      { name: "description", content: "Private conversation on Pink Cigarette." },
      { property: "og:title", content: "Conversation — Pink Cigarette" },
      { property: "og:description", content: "Private conversation on Pink Cigarette." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/messages" }],
  }),
  beforeLoad: requireAuth,
  component: ConversationPage,
});

function ConversationPage() {
  const { id } = useParams({ from: "/messages/$id" });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fetchMessages = useServerFn(getMessages);
  const sendMessageFn = useServerFn(sendMessage);
  const fetchConversations = useServerFn(getConversations);
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => fetchMessages({ data: { conversationId: id } }),
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => fetchConversations(),
  });

  const conversation = conversations.find((c) => c.id === id);
  const isA = conversation?.participant_a === user?.id;
  const other = isA ? conversation?.participant_b_profile : conversation?.participant_a_profile;

  const sendMutation = useMutation({
    mutationFn: sendMessageFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setContent("");
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    sendMutation.mutate({ data: { conversationId: id, content: content.trim() } });
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-4 pb-20 pt-4 md:pb-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Button variant="ghost" size="icon" className="shrink-0 rounded-full" asChild>
          <Link to="/messages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        {other && (
          <>
            <Avatar className="h-10 w-10">
              <AvatarImage src={other.avatar_url ?? undefined} />
              <AvatarFallback className="bg-lavender-100 text-lavender-600">
                {(other.display_name ?? other.username ?? "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-display font-semibold text-foreground">{other.display_name ?? other.username}</p>
              <p className="text-xs text-muted-foreground">@{other.username}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isMe = message.sender_id === user?.id;
            return (
              <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  <p className={`mt-1 text-[10px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {format(new Date(message.created_at), "h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border py-3">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full"
        />
        <Button type="submit" disabled={sendMutation.isPending || !content.trim()} size="icon" className="rounded-full">
          {sendMutation.isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
