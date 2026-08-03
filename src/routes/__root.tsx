import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BookOpen } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "\u067e\u0646\u0627\u0647\u06af\u0627\u0647\u0650 \u0645\u062a\u0648\u0646 \u062e\u0627\u0635\u060c \u062c\u0627\u0645\u0639\u0647 \u062e\u0648\u0627\u0646\u0646\u062f\u06af\u0627\u0646 \u0622\u0632\u0627\u062f" },
      { name: "description", content: "\u067e\u0646\u0627\u0647\u06af\u0627\u0647\u0650 \u0645\u062a\u0648\u0646 \u062e\u0627\u0635\u060c \u062c\u0627\u0645\u0639\u0647 \u062e\u0648\u0627\u0646\u0646\u062f\u06af\u0627\u0646 \u0622\u0632\u0627\u062f" },
      { property: "og:title", content: "پناهگاهِ متون خاص، جامعه خوانندگان آزاد" },
      { property: "og:description", content: "\u067e\u0646\u0627\u0647\u06af\u0627\u0647\u0650 \u0645\u062a\u0648\u0646 \u062e\u0627\u0635\u060c \u062c\u0627\u0645\u0639\u0647 \u062e\u0648\u0627\u0646\u0646\u062f\u06af\u0627\u0646 \u0622\u0632\u0627\u062f" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@sigaresorkh" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppChrome />
    </QueryClientProvider>
  );
}

const TAGLINE = "\u067e\u0646\u0627\u0647\u06af\u0627\u0647\u0650 \u0645\u062a\u0648\u0646 \u062e\u0627\u0635\u060c \u062c\u0627\u0645\u0639\u0647 \u062e\u0648\u0627\u0646\u0646\u062f\u06af\u0627\u0646 \u0622\u0632\u0627\u062f";

function AppChrome() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-center px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="ember-glow grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-300 via-rose-400 to-lavender-400 text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-display truncate text-sm font-semibold tracking-tight text-foreground md:text-lg" dir="rtl">
              {TAGLINE}
            </span>
          </Link>
        </div>
      </header>

      <div className="border-b border-border bg-background/60 px-4 py-1">
        <AdSlot />
      </div>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground" dir="rtl">
          <p className="font-display font-medium text-foreground">{TAGLINE}</p>
        </div>
      </footer>
    </div>
  );
}
