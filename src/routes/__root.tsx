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
import { AuthProvider, useAuth } from "../lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Cigarette, Home, Search, MessageCircle, User, ShoppingBag } from "lucide-react";

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
      { title: "سيگار صورتی" },
      { name: "description", content: "A social space for Iran's new generation." },
      { name: "author", content: "سيگار صورتی" },
      { property: "og:title", content: "سيگار صورتی" },
      { property: "og:description", content: "A social space for Iran's new generation." },
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
      <AuthProvider>
        <AppChrome />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppChrome() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="ember-glow grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-300 via-rose-400 to-lavender-400 text-primary-foreground">
              <Cigarette className="h-5 w-5 -rotate-12" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight text-foreground">
              سيگار صورتی
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <HeaderLink to="/" icon={Home} label="Home" />
            <HeaderLink to="/explore" icon={Search} label="Explore" />
            <HeaderLink to="/market" icon={ShoppingBag} label="Market" />
            {user && <HeaderLink to="/messages" icon={MessageCircle} label="Messages" />}
            {user && <HeaderLink to={`/profile/${user.id}`} icon={User} label="Profile" />}
          </nav>

          <div className="flex items-center gap-2">
            {!isLoading &&
              (user ? (
                <SignOutButton />
              ) : (
                <Button asChild size="sm" className="rounded-full px-5">
                  <Link to="/auth">Join</Link>
                </Button>
              ))}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <MobileNav />

      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p className="font-display font-medium text-foreground">سيگار صورتی</p>
          <p className="mt-1">A social space for Iran's new generation.</p>
          <p className="mt-4">© {new Date().getFullYear()} سيگار صورتی. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function HeaderLink({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <Link
      to={to}
      activeProps={{ className: "text-foreground bg-accent" }}
      className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function SignOutButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await supabase.auth.signOut();
        router.invalidate();
        router.navigate({ to: "/", replace: true });
      }}
    >
      Sign out
    </Button>
  );
}

function MobileNav() {
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        <MobileNavLink to="/" icon={Home} label="Home" />
        <MobileNavLink to="/explore" icon={Search} label="Explore" />
        <MobileNavLink to="/market" icon={ShoppingBag} label="Market" />
        {user && <MobileNavLink to="/messages" icon={MessageCircle} label="Messages" />}
        {user && <MobileNavLink to={`/profile/${user.id}`} icon={User} label="Profile" />}
      </div>
    </nav>
  );
}

function MobileNavLink({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <Link
      to={to}
      activeProps={{ className: "text-primary" }}
      className="flex flex-col items-center gap-1 rounded-lg p-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
