import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth";
import {
  getListings,
  createListing,
  setListingStatus,
  deleteListing,
} from "@/lib/market.functions";
import { LISTING_CATEGORIES } from "@/lib/market.constants";
import { getOrCreateConversation } from "@/lib/social.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/image-upload";
import { Plus, MessageCircle, Gift, Sparkles } from "lucide-react";

type Category = (typeof LISTING_CATEGORIES)[number];

const CATEGORY_LABELS: Record<Category, string> = {
  doll: "Doll",
  handmade: "Handmade",
  art: "Art",
  tattoo: "Tattoo art",
  vintage: "Vintage",
  other: "Other",
};

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Market — Pink Cigarette" },
      {
        name: "description",
        content: "Buy and sell dolls, handmade goods, art and vintage finds inside the Pink Cigarette community.",
      },
      { property: "og:title", content: "Market — Pink Cigarette" },
      {
        property: "og:description",
        content: "A members' market for dolls, handmade goods, art and vintage finds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/market" }],
  }),
  component: MarketPage,
});

function MarketPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchListings = useServerFn(getListings);
  const createListingFn = useServerFn(createListing);
  const setStatusFn = useServerFn(setListingStatus);
  const deleteListingFn = useServerFn(deleteListing);
  const openConversation = useServerFn(getOrCreateConversation);

  const [category, setCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [newCategory, setNewCategory] = useState<Category>("handmade");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data: listings = [] } = useQuery({
    queryKey: ["listings", category],
    queryFn: () => fetchListings({ data: { category } }),
  });

  const createMutation = useMutation({
    mutationFn: createListingFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      setTitle("");
      setDescription("");
      setPrice("");
      setImageUrl(null);
      setShowForm(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: setStatusFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listings"] }),
  });

  const removeMutation = useMutation({
    mutationFn: deleteListingFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listings"] }),
  });

  const messageMutation = useMutation({
    mutationFn: openConversation,
    onSuccess: (conversationId) => navigate({ to: "/messages/$id", params: { id: conversationId } }),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({
      data: {
        title: title.trim(),
        description: description.trim() || null,
        price: Number(price) || 0,
        currency: currency.trim() || "USD",
        category: newCategory,
        imageUrl,
      },
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-6 md:pb-10">
      <div className="smoke-panel rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Members' market
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">
              SELL Yours, BUY from Them
            </h1>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              Sell your dolls, ceramics, prints and vintage pieces to the community. Deals happen in DMs.
            </p>
          </div>
          {user ? (
            <Button onClick={() => setShowForm((v) => !v)} className="rounded-full px-5">
              <Plus className="mr-2 h-4 w-4" />
              {showForm ? "Close" : "Sell something"}
            </Button>
          ) : (
            <Button asChild className="rounded-full px-5">
              <Link to="/auth">Sign in to sell</Link>
            </Button>
          )}
        </div>
      </div>

      {showForm && user && (
        <form onSubmit={handleCreate} className="card-soft mt-6 space-y-3 rounded-2xl p-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you selling?"
            className="rounded-xl"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell the story behind it…"
            className="min-h-[90px] resize-none rounded-xl"
          />
          <div className="flex flex-wrap gap-2">
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="Price"
              className="w-32 rounded-xl"
            />
            <Input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="USD"
              className="w-24 rounded-xl"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as Category)}
              className="h-9 rounded-xl border border-input bg-background px-3 text-sm text-foreground"
            >
              {LISTING_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <ImageUpload value={imageUrl} onChange={setImageUrl} label="Upload a product photo" />
          <Button
            type="submit"
            disabled={createMutation.isPending || !title.trim()}
            className="w-full rounded-xl"
          >
            {createMutation.isPending ? "Publishing…" : "Publish listing"}
          </Button>
          {createMutation.isError && (
            <p className="text-sm text-destructive" role="alert">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : "Could not publish your listing."}
            </p>
          )}
        </form>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <CategoryChip active={category === null} onClick={() => setCategory(null)} label="All" />
        {LISTING_CATEGORIES.map((c) => (
          <CategoryChip
            key={c}
            active={category === c}
            onClick={() => setCategory(c)}
            label={CATEGORY_LABELS[c]}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {listings.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
            Nothing here yet. Be the first to list something.
          </p>
        )}
        {listings.map((listing) => {
          const seller = listing.profiles;
          const isMine = !!user && seller?.user_id === user.id;
          return (
            <article key={listing.id} className="card-soft overflow-hidden rounded-2xl">
              {listing.image_url ? (
                <img
                  src={listing.image_url}
                  alt={listing.title}
                  loading="lazy"
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="grid h-48 w-full place-items-center gradient-hero">
                  <Gift className="h-10 w-10 text-rose-500" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold text-foreground">{listing.title}</h2>
                  <span className="whitespace-nowrap font-display text-sm font-semibold text-primary">
                    {listing.price} {listing.currency}
                  </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  {CATEGORY_LABELS[(listing.category as Category) ?? "other"] ?? listing.category}
                </p>
                {listing.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{listing.description}</p>
                )}

                {seller && (
                  <div className="mt-4 flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={seller.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-lavender-100 text-xs text-lavender-600">
                        {(seller.display_name ?? seller.username ?? "?").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Link
                      to="/profile/$id"
                      params={{ id: seller.user_id }}
                      className="truncate text-sm text-muted-foreground hover:underline"
                    >
                      @{seller.username}
                    </Link>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {isMine ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() =>
                          statusMutation.mutate({ data: { listingId: listing.id, status: "sold" } })
                        }
                      >
                        Mark sold
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-destructive"
                        onClick={() => removeMutation.mutate({ data: { listingId: listing.id } })}
                      >
                        Delete
                      </Button>
                    </>
                  ) : user && seller ? (
                    <Button
                      size="sm"
                      className="rounded-full"
                      disabled={messageMutation.isPending}
                      onClick={() => messageMutation.mutate({ data: { otherProfileId: seller.id } })}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" /> Message seller
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link to="/auth">Sign in to buy</Link>
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
