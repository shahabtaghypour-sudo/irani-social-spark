import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Search } from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";
import { BOOKS, BOOK_CATEGORIES } from "@/lib/books";

const TAGLINE = "A sanctuary for rare texts. A society of free readers.";

const searchSchema = z.object({
  q: z.string().catch(""),
  cat: z.string().catch("All"),
  sort: z.enum(["newest", "oldest", "title"]).catch("newest"),
});

type BookSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
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

function BookstorePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const query = search.q;
  const category = search.cat;
  const sort = search.sort;

  const setSearch = (patch: Partial<BookSearch>) => {
    navigate({ search: (prev) => ({ ...prev, ...patch }) });
  };

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
      sort === "title"
        ? a.title.localeCompare(b.title)
        : sort === "oldest"
          ? Number(a.id) - Number(b.id)
          : Number(b.id) - Number(a.id),
    );
  }, [query, category, sort]);

  return (
    <div className="flex flex-col">
      <section className="gradient-hero relative overflow-hidden px-4 pt-4 pb-5">
        <div className="doll-frame mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-lavender-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display whitespace-nowrap text-sm font-semibold leading-snug tracking-tight text-foreground md:text-base">
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
              onChange={(e) => setSearch({ q: e.target.value })}
              placeholder="Search by title or author…"
              className="card-soft w-full rounded-xl py-2.5 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {BOOK_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSearch({ cat: c })}
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
              onChange={(e) => setSearch({ sort: e.target.value as BookSearch["sort"] })}
              aria-label="Sort books"
              className="card-soft ml-auto rounded-full px-3 py-1 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="newest">Recently added</option>
              <option value="oldest">Oldest added</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <Link
              key={book.id}
              to="/books/$id"
              params={{ id: book.id }}
              search={{ q: query, cat: category, sort }}
              className="group card-soft doll-hover flex flex-col rounded-2xl p-4 transition-transform hover:-translate-y-1"
            >
              <div className="mb-3 flex aspect-[3/4] items-center justify-center rounded-xl bg-muted/40">
                <BookOpen className="h-6 w-6 text-lavender-600" aria-hidden="true" />
              </div>
              <h2 className="font-display text-sm font-semibold leading-tight text-foreground group-hover:text-primary">
                {book.title}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{book.author}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {book.category} · {book.year}
              </p>
              {typeof book.price === "number" && (
                <p className="mt-2 text-sm font-semibold text-primary">${book.price}</p>
              )}
              {book.description && (
                <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-muted-foreground">
                  {book.description}
                </p>
              )}
            </Link>
          ))}
        </div>

        {books.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No books match your search.</p>
        )}
      </section>
    </div>
  );
}
