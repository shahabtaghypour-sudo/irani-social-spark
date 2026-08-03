import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";

const TITLE = "Donate — Pink Cigarette Bookstore";
const DESC = "Support free reading: fund rare reprints, shipping to readers, and an open shelf.";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
    ],
  }),
  component: DonatePage,
});

const TIERS = [
  { amount: "$5", label: "A page" },
  { amount: "$25", label: "A chapter" },
  { amount: "$100", label: "A whole shelf" },
];

function DonatePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 text-center">
      <div className="doll-frame mx-auto flex h-14 w-14 items-center justify-center rounded-full text-rose-600">
        <Heart className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground md:text-4xl">
        <span className="text-gradient">Donate</span>
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Every contribution keeps a rare text in print and in someone's hands.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.amount} className="card-soft doll-hover rounded-2xl p-6">
            <p className="font-display text-2xl font-bold text-foreground">{t.amount}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">{t.label}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Payment processing coming soon — reach out via Support to contribute today.
      </p>
    </div>
  );
}
