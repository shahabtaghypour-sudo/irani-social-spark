import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { DollIcon } from "@/components/doll-icon";
import { Heart, MessageCircle, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pink Cigarette — social media for a new generation" },
      {
        name: "description",
        content: "A social media for the new generation — connect, share, and sell.",
      },
      { property: "og:title", content: "Pink Cigarette — social media for a new generation" },
      { property: "og:description", content: "A social media for the new generation — connect, share, and sell." },
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
      <section className="gradient-hero relative overflow-hidden px-4 pt-10 pb-12 md:pt-14 md:pb-16">
        <div className="doll-frame mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-lavender-600 md:h-20 md:w-20">
          <DollIcon className="h-8 w-8 md:h-10 md:w-10" />
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
            A Social media for <span className="text-gradient">new generation</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
            Connect, Share, and sell
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {user ? (
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/feed">Open feed</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link to="/auth">Join</Link>
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
      <section className="mx-auto w-full max-w-5xl px-4 py-14 md:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={Sparkles} title="Share" description="Post thoughts & art." />
          <FeatureCard icon={Users} title="Connect" description="Find your people." />
          <FeatureCard icon={Heart} title="Love" description="Like what moves you." />
          <FeatureCard icon={MessageCircle} title="Talk" description="Private messages." />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card px-4 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">Join now.</h2>
          <p className="mt-2 text-muted-foreground">Start sharing your world.</p>
          <div className="mt-5">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/auth">Create account</Link>
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
    <div className="card-soft doll-hover rounded-2xl p-5 transition-transform hover:-translate-y-1">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-lavender-100 text-lavender-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
