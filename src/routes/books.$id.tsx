import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { BOOKS } from "@/lib/books";

export const Route = createFileRoute("/books/$id")({
  parseParams: (params) => ({ id: params.id }),
  loader: ({ params }) => {
    const book = BOOKS.find((b) => b.id === params.id);
    if (!book) throw notFound();
    return book;
  },
  head: ({ loaderData: book }) => ({
    meta: [
      { title: `${book.title} — Pink Cigarette Bookstore` },
      { name: "description", content: book.description || `A ${book.category} book by ${book.author}.` },
      { property: "og:title", content: `${book.title} — Pink Cigarette Bookstore` },
      { property: "og:description", content: book.description || `A ${book.category} book by ${book.author}.` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `/books/${book.id}` }],
  }),
  component: BookDetailPage,
  notFoundComponent: BookNotFound,
});

function BookDetailPage() {
  const book = Route.useLoaderData();
  const search = Route.useSearch();

  const backSearch = {
    q: typeof search.q === "string" ? search.q : "",
    cat: typeof search.cat === "string" ? search.cat : "All",
    sort: ["newest", "oldest", "title"].includes(search.sort as string) ? (search.sort as "newest" | "oldest" | "title") : "newest",
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <Link
        to="/"
        search={backSearch}
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to books
      </Link>

      <article className="mt-5 card-soft rounded-2xl p-5 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="doll-frame flex aspect-[3/4] w-full shrink-0 items-center justify-center rounded-2xl bg-muted/40 sm:w-44">
            <BookOpen className="h-12 w-12 text-lavender-600" aria-hidden="true" />
          </div>

          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
              {book.category}
            </p>
            <h1 className="mt-1 font-display text-xl font-bold leading-tight text-foreground sm:text-2xl">
              {book.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">by {book.author}</p>
            <p className="mt-1 text-xs text-muted-foreground">Published {book.year}</p>

            {typeof book.price === "number" && (
              <p className="mt-4 text-2xl font-bold text-primary">${book.price}</p>
            )}
          </div>
        </div>

        {book.description && (
          <div className="mt-6 border-t border-border pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              About this book
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
              {book.description}
            </p>
          </div>
        )}
      </article>
    </div>
  );
}

function BookNotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 text-center">
      <h1 className="font-display text-2xl font-bold text-foreground">Book not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">That title is not on our shelves.</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Back to books
      </Link>
    </div>
  );
}
