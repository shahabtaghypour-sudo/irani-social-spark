import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, Mail, MessageCircle } from "lucide-react";

const TITLE = "Support — Pink Cigarette Bookstore";
const DESC = "Get help with orders, rare text requests, and membership of the reading society.";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SupportPage,
});

const ITEMS = [
  { icon: Mail, title: "Email us", body: "hello@pinkcigarette.books — replies within two days." },
  { icon: MessageCircle, title: "Request a text", body: "Looking for something rare? Tell us the title and edition." },
  { icon: LifeBuoy, title: "Orders & shipping", body: "Questions about a shipment, refund, or damaged spine." },
];

function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-4xl">
        <span className="text-gradient">Support</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">We keep it simple and human.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {ITEMS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card-soft doll-hover rounded-2xl p-5">
            <Icon className="h-5 w-5 text-lavender-600" aria-hidden="true" />
            <h2 className="mt-3 font-display text-base font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
