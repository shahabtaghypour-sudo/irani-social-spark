import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface PostCardData {
  id: string;
  content: string;
  image_url: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  profiles: {
    user_id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface PostCardProps {
  post: PostCardData;
  liked?: boolean;
  onToggleLike?: (liked: boolean) => void;
  showAuthor?: boolean;
}

export function PostCard({ post, liked = false, onToggleLike, showAuthor = true }: PostCardProps) {
  const author = post.profiles;

  return (
    <article className="card-soft overflow-hidden rounded-2xl">
      <div className="p-4">
        {showAuthor && author && (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={author.avatar_url ?? undefined} />
              <AvatarFallback className="bg-lavender-100 text-lavender-600">
                {(author.display_name ?? author.username ?? "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Link
                to="/profile/$id"
                params={{ id: author.user_id }}
                className="block truncate font-display font-semibold text-foreground hover:underline"
              >
                {author.display_name ?? author.username}
              </Link>
              <p className="text-xs text-muted-foreground">@{author.username}</p>
            </div>
          </div>
        )}
        <p className={`whitespace-pre-wrap text-foreground ${showAuthor ? "mt-3" : ""}`}>{post.content}</p>
        {post.image_url && (
          <div className="mt-3 overflow-hidden rounded-xl">
            <img src={post.image_url} alt="Post media" className="max-h-[400px] w-full object-cover" />
          </div>
        )}
        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
          {onToggleLike ? (
            <button
              onClick={() => onToggleLike(!liked)}
              className={`flex items-center gap-1.5 transition-colors ${liked ? "text-rose-500" : "hover:text-foreground"}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              {post.like_count}
            </button>
          ) : (
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              {post.like_count}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            {post.comment_count}
          </span>
          <span className="ml-auto text-xs">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </article>
  );
}
