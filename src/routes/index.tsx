import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BOOKS, BOOK_CATEGORIES } from "@/lib/books";

const TAGLINE = "A sanctuary for rare texts. A society of free readers.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pink Cigarette Bookstore — Rare Texts for Free Readers" },
      { name: "description", content: TAGLINE },
      { property: "og:title", content: "Pink Cigarette Bookstore — Rare Texts for Free Readers" },
      { property: "og:description", content: TAGLINE },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: BookstorePage,
});

type SortKey = "newest" | "oldest" | "title";

function BookstorePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("newest");

  const books = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = BOOKS.filter((b) => {
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q));
      const matchesCat = category === "All" || b.category === category;
      return matchesQuery && matchesCat;
    });
    return list.sort((a, b) =>
      sort === "title" ? a.title.localeCompare(b.title) : sort === "oldest" ? a.year - b.year : b.year - a.year,
    );
  }, [query, category, sort]);

  return (
    <div className="flex flex-col">
      <section className="gradient-hero relative overflow-hidden px-4 pt-4 pb-5">
        <div className="doll-frame mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-lavender-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-base font-semibold leading-snug tracking-tight text-foreground md:text-xl">
            <span className="text-gradient">{TAGLINE}</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-5">
        <div className="flex flex-col gap-3">
          <label className="relative block">
            <span className="sr-only">Search books</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or author…"
              className="card-soft w-full rounded-xl py-2.5 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {BOOK_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={
                  category === c
                    ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                    : "card-soft rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {c}
              </button>
            ))}

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort books"
              className="card-soft ml-auto rounded-full px-3 py-1 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <article
              key={book.id}
              className="card-soft doll-hover flex flex-col rounded-2xl p-4 transition-transform hover:-translate-y-1"
            >
              <div className="mb-3 flex aspect-[3/4] items-center justify-center rounded-xl bg-muted/40">
                <BookOpen className="h-6 w-6 text-lavender-600" aria-hidden="true" />
              </div>
              <h2 className="font-display text-sm font-semibold leading-tight text-foreground">{book.title}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{book.author}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {book.category} · {book.year}
              </p>
              {typeof book.price === "number" && (
                <p className="mt-2 text-sm font-semibold text-primary">${book.price}</p>
              )}
              {book.description && (
                <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-muted-foreground">{book.description}</p>
              )}
            </article>
          ))}
        </div>

        {books.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No books match your search.</p>
        )}
      </section>
    </div>
  );
}
