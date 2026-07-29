import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Heart, MessageCircle, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "سيگار صورتی — A social space for Iran's new generation" },
      {
        name: "description",
        content:
          "Join سيگار صورتی — a soft, poetic social platform built for Iran's new generation to share, connect, and speak freely.",
      },
      { property: "og:title", content: "سيگار صورتی — A social space for Iran's new generation" },
      {
        property: "og:description",
        content:
          "Join سيگار صورتی — a soft, poetic social platform built for Iran's new generation to share, connect, and speak freely.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden px-4 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
            A quiet corner for the <span className="text-gradient">new generation</span> of Iran.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            سيگار صورتی is a social space to share thoughts, art, and moments — softly, freely, and
            without noise.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {user ? (
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/feed">Open feed</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link to="/auth">Join the community</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                  <Link to="/explore">Explore</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16 md:py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={Sparkles}
            title="Share freely"
            description="Post text, images, and ideas in a calm, uncluttered feed."
          />
          <FeatureCard
            icon={Users}
            title="Find your people"
            description="Follow creators, discover new voices, and build your circle."
          />
          <FeatureCard
            icon={Heart}
            title="Show love"
            description="Like and comment on posts that move you."
          />
          <FeatureCard
            icon={MessageCircle}
            title="Message privately"
            description="Have one-on-one conversations away from the feed."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
            Ready to join?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Sign up in seconds and start sharing your world.
          </p>
          <div className="mt-6">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/auth">Create an account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="card-soft rounded-2xl p-6 transition-transform hover:-translate-y-1">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-lavender-100 text-lavender-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
