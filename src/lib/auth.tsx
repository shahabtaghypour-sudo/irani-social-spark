import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, isLoading: true });

async function bootstrapProfile(user: User) {
  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError || existing) return;

  await supabase.from("profiles").insert({
    user_id: user.id,
    username: `member_${user.id.replaceAll("-", "").slice(0, 12)}`,
    display_name:
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
      (typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name) ||
      "New member",
    avatar_url: typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (!error) {
        setUser(data.user);
        if (data.user) void bootstrapProfile(data.user);
      }
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) void bootstrapProfile(session.user);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
