import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

const TAGLINE = "پناهگاهِ متون خاص، جامعه خوانندگان آزاد";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TAGLINE },
      { name: "description", content: TAGLINE },
      { property: "og:title", content: TAGLINE },
      { property: "og:description", content: TAGLINE },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: BookstorePage,
});

function BookstorePage() {
  return (
    <div className="flex flex-col">
      <section className="gradient-hero relative overflow-hidden px-4 pt-8 pb-12 md:pt-12 md:pb-16">
        <div className="doll-frame mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-lavender-600 md:h-20 md:w-20">
          <BookOpen className="h-8 w-8 md:h-10 md:w-10" />
        </div>
        <div className="mx-auto max-w-3xl text-center" dir="rtl">
          <h1 className="font-display text-3xl font-bold leading-snug tracking-tight text-foreground md:text-5xl">
            <span className="text-gradient">{TAGLINE}</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-12 md:py-16">
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="card-soft doll-hover flex aspect-[3/4] items-center justify-center rounded-2xl p-5 transition-transform hover:-translate-y-1"
            >
              <BookOpen className="h-7 w-7 text-lavender-600" aria-hidden="true" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
